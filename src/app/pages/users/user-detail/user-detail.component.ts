import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../auth';
import { UserDTO } from '../../../models/user.model';
import { OrderDTO } from '../../../models/order.model';

@Component({
  selector: 'app-user-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // State signals
  user = signal<UserDTO | null>(null);
  orders = signal<OrderDTO[]>([]);
  isLoading = signal<boolean>(false);
  isLoadingOrders = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed values
  hasUser = computed(() => this.user() !== null);
  isAdmin = computed(() => this.authService.hasRole('ADMIN'));
  hasOrders = computed(() => this.orders().length > 0);
  userInitials = computed(() => {
    const user = this.user();
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  });
  fullName = computed(() => {
    const user = this.user();
    if (!user) return '';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(parseInt(id, 10));
    } else {
      this.error.set('Invalid user ID');
    }
  }

  loadUser(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService.getById(id).subscribe({
      next: (user: UserDTO) => {
        this.user.set(user);
        this.isLoading.set(false);
        this.loadUserOrders(id);
      },
      error: (err) => {
        this.error.set('Failed to load user details. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading user:', err);
      }
    });
  }

  loadUserOrders(userId: number): void {
    this.isLoadingOrders.set(true);
    this.orderService.getByUserId(userId, 0, 5).subscribe({
      next: (response) => {
        this.orders.set(response.content);
        this.isLoadingOrders.set(false);
      },
      error: (err) => {
        console.error('Error loading user orders:', err);
        this.isLoadingOrders.set(false);
      }
    });
  }

  deleteUser(): void {
    const user = this.user();
    if (!user?.id) return;

    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userService.delete(user.id).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.error.set('Failed to delete user.');
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
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
