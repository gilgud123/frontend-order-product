import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services';
import { ProductDTO } from '../../../models/product.model';
import { LoadingSpinnerComponent } from '../../../shared';
import { PaginationComponent } from '../../../shared';
import { SearchBarComponent } from '../../../shared';
import { AuthService } from '../../../auth';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    PaginationComponent,
    SearchBarComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);

  products: ProductDTO[] = [];
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;
  isLoading = false;
  error: string | null = null;
  isAdmin = false;

  ngOnInit(): void {
    this.checkAdminRole();
    this.loadProducts();
  }

  checkAdminRole(): void {
    this.isAdmin = this.authService.hasRole('ADMIN');
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;

    this.productService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.products = response.content;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (_err) => {
        this.error = 'Failed to load products';
        this.isLoading = false;
        console.error('Error loading products:', _err);
      }
    });
  }

  onSearch(query: string): void {
    if (!query.trim()) {
      this.loadProducts();
      return;
    }

    this.isLoading = true;
    this.productService.search(query, 0, this.pageSize).subscribe({
      next: (response) => {
        this.products = response.content;
        this.totalPages = response.totalPages;
        this.currentPage = 0;
        this.isLoading = false;
      },
      error: (_err) => {
        this.error = 'Failed to search products';
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.productService.delete(id).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (_err) => {
        this.error = 'Failed to delete product';
        console.error('Error deleting product:', _err);
      }
    });
  }
}
