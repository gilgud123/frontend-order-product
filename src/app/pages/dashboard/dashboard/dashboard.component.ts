import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services';
import { OrderService, OrderStatistics } from '../../../services';
import { UserService } from '../../../services';
import { AuthService } from '../../../auth';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue?: number;
  pendingOrders?: number;
}

interface QuickAction {
  icon: string;
  title: string;
  description: string;
  route: string;
  requiresAdmin: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  stats = signal<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  isAdmin = signal(false);
  isLoading = signal(true);
  userName = signal<string>('User');
  error = signal<string | null>(null);

  quickActions = signal<QuickAction[]>([
    {
      icon: '📦',
      title: 'Browse Products',
      description: 'View and manage products',
      route: '/products',
      requiresAdmin: false
    },
    {
      icon: '➕',
      title: 'Create Order',
      description: 'Place a new order',
      route: '/orders/new',
      requiresAdmin: false
    },
    {
      icon: '📋',
      title: 'My Orders',
      description: 'View your order history',
      route: '/orders/my-orders',
      requiresAdmin: false
    },
    {
      icon: '👤',
      title: 'Profile',
      description: 'Update your profile',
      route: '/profile',
      requiresAdmin: false
    },
    {
      icon: '👥',
      title: 'Manage Users',
      description: 'User administration',
      route: '/users',
      requiresAdmin: true
    },
    {
      icon: '📊',
      title: 'Reports',
      description: 'View analytics and reports',
      route: '/reports',
      requiresAdmin: true
    }
  ]);

  visibleActions = computed(() => {
    const actions = this.quickActions();
    if (this.isAdmin()) {
      return actions;
    }
    return actions.filter(a => !a.requiresAdmin);
  });

  statCards = computed(() => {
    const currentStats = this.stats();
    const cards = [];

    if (this.isAdmin()) {
      cards.push(
        {
          title: 'Total Products',
          value: currentStats.totalProducts,
          icon: '📦',
          link: '/products',
          color: 'blue'
        },
        {
          title: 'Total Orders',
          value: currentStats.totalOrders,
          icon: '📋',
          link: '/orders',
          color: 'green'
        },
        {
          title: 'Total Users',
          value: currentStats.totalUsers,
          icon: '👥',
          link: '/users',
          color: 'purple'
        }
      );

      if (currentStats.lowStockProducts && currentStats.lowStockProducts > 0) {
        cards.push({
          title: 'Low Stock Alert',
          value: currentStats.lowStockProducts,
          icon: '⚠️',
          link: '/products',
          color: 'orange'
        });
      }

      if (currentStats.pendingOrders && currentStats.pendingOrders > 0) {
        cards.push({
          title: 'Pending Orders',
          value: currentStats.pendingOrders,
          icon: '⏳',
          link: '/orders',
          color: 'yellow'
        });
      }

      if (currentStats.totalRevenue) {
        cards.push({
          title: 'Total Revenue',
          value: `$${currentStats.totalRevenue.toLocaleString()}`,
          icon: '💰',
          link: '/reports',
          color: 'teal'
        });
      }
    } else {
      cards.push({
        title: 'My Orders',
        value: currentStats.totalOrders,
        icon: '📋',
        link: '/orders/my-orders',
        color: 'blue'
      });
    }

    return cards;
  });

  ngOnInit(): void {
    this.isAdmin.set(this.authService.hasRole('ADMIN'));
    this.loadUserProfile();
    this.loadDashboardStats();
  }

  private loadUserProfile(): void {
    this.authService.user$.subscribe({
      next: (user) => {
        const name = user?.name || user?.preferred_username || 'User';
        this.userName.set(name);
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
      }
    });
  }

  private loadDashboardStats(): void {
    this.isLoading.set(true);
    this.error.set(null);

    if (this.isAdmin()) {
      this.loadAdminStats();
    } else {
      this.loadUserStats();
    }
  }

  private loadAdminStats(): void {
    let completedCalls = 0;
    const totalCalls = 5;

    const checkComplete = () => {
      completedCalls++;
      if (completedCalls >= totalCalls) {
        this.isLoading.set(false);
      }
    };

    // Load products count
    this.productService.getAll(0, 1).subscribe({
      next: (response) => {
        this.stats.update(s => ({ ...s, totalProducts: response.totalElements }));
        checkComplete();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        checkComplete();
      }
    });

    // Load low stock products
    this.productService.getLowStock(10).subscribe({
      next: (products) => {
        this.stats.update(s => ({ ...s, lowStockProducts: products.length }));
        checkComplete();
      },
      error: (err) => {
        console.error('Error loading low stock:', err);
        checkComplete();
      }
    });

    // Load orders count
    this.orderService.getAll(0, 1).subscribe({
      next: (response) => {
        this.stats.update(s => ({ ...s, totalOrders: response.totalElements }));
        checkComplete();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        checkComplete();
      }
    });

    // Load users count
    this.userService.getAll(0, 1).subscribe({
      next: (response) => {
        this.stats.update(s => ({ ...s, totalUsers: response.totalElements }));
        checkComplete();
      },
      error: (err) => {
        console.error('Error loading users:', err);
        checkComplete();
      }
    });

    // Load order statistics
    this.orderService.getStatistics().subscribe({
      next: (statistics: OrderStatistics) => {
        this.stats.update(s => ({
          ...s,
          totalRevenue: statistics.totalRevenue,
          pendingOrders: statistics.pendingOrders
        }));
        checkComplete();
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        checkComplete();
      }
    });
  }

  private loadUserStats(): void {
    this.orderService.getMyOrders(0, 1).subscribe({
      next: (response) => {
        this.stats.update(s => ({ ...s, totalOrders: response.totalElements }));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading user orders:', err);
        this.error.set('Failed to load dashboard data');
        this.isLoading.set(false);
      }
    });
  }

  refresh(): void {
    this.loadDashboardStats();
  }
}
