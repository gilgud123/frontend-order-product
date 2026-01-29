import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services';
import { ProductDTO } from '../../../models/product.model';
import { AuthService } from '../../../auth';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // State signals
  product = signal<ProductDTO | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed values
  hasProduct = computed(() => this.product() !== null);
  isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  stockClass = computed(() => {
    const stock = this.product()?.stockQuantity || 0;
    if (stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    return 'in-stock';
  });
  stockLabel = computed(() => {
    const stock = this.product()?.stockQuantity || 0;
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(parseInt(id, 10));
    } else {
      this.error.set('Invalid product ID');
    }
  }

  loadProduct(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getById(id).subscribe({
      next: (product: ProductDTO) => {
        this.product.set(product);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load product details. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading product:', err);
      }
    });
  }

  deleteProduct(): void {
    const product = this.product();
    if (!product?.id) return;

    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.productService.delete(product.id).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error.set('Failed to delete product.');
          console.error('Error deleting product:', err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

