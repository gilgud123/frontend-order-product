import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../services';
import { ProductDTO } from '../../../models/product.model';
import { LoadingSpinnerComponent } from '../../../shared';
import { AuthService } from '../../../auth';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  product?: ProductDTO;
  isLoading = false;
  error: string | null = null;
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ADMIN');
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
    }
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load product details';
        this.isLoading = false;
        console.error('Error loading product:', err);
      }
    });
  }

  deleteProduct(): void {
    if (!this.product?.id || !confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.productService.delete(this.product.id).subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.error = 'Failed to delete product';
        console.error('Error deleting product:', err);
      }
    });
  }
}
