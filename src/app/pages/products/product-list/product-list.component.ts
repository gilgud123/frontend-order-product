import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services';
import { ProductDTO } from '../../../models/product.model';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import { AuthService } from '../../../auth';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);

  // State signals
  products = signal<ProductDTO[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Pagination signals
  currentPage = signal<number>(0);
  pageSize = signal<number>(12);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  // Filter signals
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('ALL');
  minPrice = signal<string>('');
  maxPrice = signal<string>('');
  stockFilter = signal<string>('ALL'); // ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK

  // Sort signals
  sortBy = signal<string>('name'); // name, price, stock, date
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Computed values
  hasProducts = computed(() => this.products().length > 0);
  hasPreviousPage = computed(() => this.currentPage() > 0);
  hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);
  isAdmin = computed(() => this.authService.hasRole('ADMIN'));

  // Available categories (could be fetched from API)
  readonly categories = ['ALL', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Other'];
  readonly stockFilters = ['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const query = this.searchQuery();
    const category = this.selectedCategory();
    const min = this.minPrice();
    const max = this.maxPrice();

    let request;

    // Search query takes precedence
    if (query) {
      request = this.productService.search(query, this.currentPage(), this.pageSize());
    }
    // Filter by category and price
    else if (category !== 'ALL' || min || max) {
      const filters: any = {};
      if (category !== 'ALL') filters.category = category;
      if (min) filters.minPrice = parseFloat(min);
      if (max) filters.maxPrice = parseFloat(max);

      request = this.productService.filter(filters, this.currentPage(), this.pageSize());
    }
    // Default: load all
    else {
      request = this.productService.getAll(this.currentPage(), this.pageSize());
    }

    request.subscribe({
      next: (response: PaginatedResponse<ProductDTO>) => {
        let products = response.content;

        // Apply client-side stock filtering
        products = this.applyStockFilter(products);

        // Apply client-side sorting
        products = this.applySorting(products);

        this.products.set(products);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  private applyStockFilter(products: ProductDTO[]): ProductDTO[] {
    const filter = this.stockFilter();
    switch (filter) {
      case 'IN_STOCK':
        return products.filter(p => (p.stockQuantity || 0) > 10);
      case 'LOW_STOCK':
        return products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 10);
      case 'OUT_OF_STOCK':
        return products.filter(p => (p.stockQuantity || 0) === 0);
      default:
        return products;
    }
  }

  private applySorting(products: ProductDTO[]): ProductDTO[] {
    const sortBy = this.sortBy();
    const order = this.sortOrder();

    return [...products].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'stock':
          comparison = (a.stockQuantity || 0) - (b.stockQuantity || 0);
          break;
        case 'date':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comparison = dateB - dateA; // Newest first by default
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadProducts();
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadProducts();
  }

  onSortChange(): void {
    this.loadProducts();
  }

  toggleSortOrder(): void {
    this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('ALL');
    this.minPrice.set('');
    this.maxPrice.set('');
    this.stockFilter.set('ALL');
    this.currentPage.set(0);
    this.loadProducts();
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          this.error.set('Failed to delete product.');
          console.error('Error deleting product:', err);
        }
      });
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(page => page - 1);
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(page => page + 1);
      this.loadProducts();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }

  getStockClass(stock?: number): string {
    if (!stock || stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    return 'in-stock';
  }

  getStockLabel(stock?: number): string {
    if (!stock || stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  formatCurrency(amount?: number): string {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected readonly Math = Math;
}
