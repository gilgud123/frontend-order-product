import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../auth';
import { OrderDTO } from '../../../models/order.model';
import { ProductDTO } from '../../../models/product.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderDetailComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // State signals
  order = signal<OrderDTO | null>(null);
  products = signal<ProductDTO[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed values
  hasOrder = computed(() => this.order() !== null);
  isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  canCancel = computed(() => {
    const status = this.order()?.status?.toUpperCase();
    return status === 'PENDING' || status === 'PROCESSING';
  });

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(parseInt(orderId, 10));
    } else {
      this.error.set('Invalid order ID');
    }
  }

  loadOrderDetails(orderId: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.orderService.getById(orderId).subscribe({
      next: (order: OrderDTO) => {
        this.order.set(order);
        this.loadProducts(order.productIds);
      },
      error: (err) => {
        this.error.set('Failed to load order details. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading order:', err);
      }
    });
  }

  loadProducts(productIds: number[]): void {
    if (!productIds || productIds.length === 0) {
      this.isLoading.set(false);
      return;
    }

    const productRequests = productIds.map(id =>
      this.productService.getById(id).pipe(
        catchError(err => {
          console.error(`Error loading product ${id}:`, err);
          return of(null);
        })
      )
    );

    forkJoin(productRequests).subscribe({
      next: (products) => {
        this.products.set(products.filter(p => p !== null) as ProductDTO[]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading.set(false);
      }
    });
  }

  updateStatus(newStatus: string): void {
    const order = this.order();
    if (!order?.id) return;

    if (confirm(`Are you sure you want to change this order status to ${newStatus}?`)) {
      this.orderService.updateStatus(order.id, newStatus).subscribe({
        next: (updatedOrder) => {
          this.order.set(updatedOrder);
        },
        error: (err) => {
          this.error.set('Failed to update order status.');
          console.error('Error updating order status:', err);
        }
      });
    }
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order?.id) return;

    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancel(order.id).subscribe({
        next: (updatedOrder) => {
          this.order.set(updatedOrder);
        },
        error: (err) => {
          this.error.set('Failed to cancel order.');
          console.error('Error cancelling order:', err);
        }
      });
    }
  }

  deleteOrder(): void {
    const order = this.order();
    if (!order?.id) return;

    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      this.orderService.delete(order.id).subscribe({
        next: () => {
          this.router.navigate(['/orders']);
        },
        error: (err) => {
          this.error.set('Failed to delete order.');
          console.error('Error deleting order:', err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  getStatusClass(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'status-pending';
      case 'PROCESSING': return 'status-processing';
      case 'SHIPPED': return 'status-shipped';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-unknown';
    }
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

  formatCurrency(amount?: number): string {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
