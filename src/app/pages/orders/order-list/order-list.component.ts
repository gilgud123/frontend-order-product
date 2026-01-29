import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { OrderDTO } from '../../../models/order.model';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  // State signals
  orders = signal<OrderDTO[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Pagination signals
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  // Filter signals
  selectedStatus = signal<string>('ALL');
  searchUserId = signal<string>('');

  // Computed values
  hasOrders = computed(() => this.orders().length > 0);
  hasPreviousPage = computed(() => this.currentPage() > 0);
  hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);

  // Order statuses
  readonly statuses = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const status = this.selectedStatus();
    const userId = this.searchUserId();

    let request;
    if (status !== 'ALL') {
      request = this.orderService.getByStatus(status, this.currentPage(), this.pageSize());
    } else if (userId) {
      const userIdNum = parseInt(userId, 10);
      if (!isNaN(userIdNum)) {
        request = this.orderService.getByUserId(userIdNum, this.currentPage(), this.pageSize());
      } else {
        request = this.orderService.getAll(this.currentPage(), this.pageSize());
      }
    } else {
      request = this.orderService.getAll(this.currentPage(), this.pageSize());
    }

    request.subscribe({
      next: (response: PaginatedResponse<OrderDTO>) => {
        this.orders.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load orders. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading orders:', err);
      }
    });
  }

  onStatusFilterChange(): void {
    this.currentPage.set(0);
    this.loadOrders();
  }

  onUserIdSearch(): void {
    this.currentPage.set(0);
    this.loadOrders();
  }

  updateOrderStatus(orderId: number, newStatus: string): void {
    if (confirm(`Are you sure you want to change this order status to ${newStatus}?`)) {
      this.orderService.updateStatus(orderId, newStatus).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          this.error.set('Failed to update order status.');
          console.error('Error updating order status:', err);
        }
      });
    }
  }

  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      this.orderService.delete(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          this.error.set('Failed to delete order.');
          console.error('Error deleting order:', err);
        }
      });
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(page => page - 1);
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(page => page + 1);
      this.loadOrders();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadOrders();
    }
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
      month: 'short',
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

  protected readonly Math = Math;
}
