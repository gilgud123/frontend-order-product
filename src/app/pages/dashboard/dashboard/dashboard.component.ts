import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services';
import { OrderService } from '../../../services';
import { UserService } from '../../../services';
import { AuthService } from '../../../auth';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  totalUsers: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  stats: DashboardStats = {
    totalProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    totalUsers: 0
  };

  isAdmin = false;
  isLoading = true;
  userName?: string;

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.loadUserProfile();
    this.loadDashboardStats();
  }

  loadUserProfile(): void {
    this.authService.user$.subscribe({
      next: (user) => {
        this.userName = user?.name || user?.preferred_username || 'User';
      }
    });
  }

  loadDashboardStats(): void {
    if (this.isAdmin) {
      // Load admin statistics
      this.productService.getAll(0, 1).subscribe({
        next: (response) => {
          this.stats.totalProducts = response.totalElements;
        }
      });

      this.productService.getLowStock(10).subscribe({
        next: (products) => {
          this.stats.lowStockProducts = products.length;
        }
      });

      this.orderService.getAll(0, 1).subscribe({
        next: (response) => {
          this.stats.totalOrders = response.totalElements;
        }
      });

      this.userService.getAll(0, 1).subscribe({
        next: (response) => {
          this.stats.totalUsers = response.totalElements;
          this.isLoading = false;
        }
      });
    } else {
      // Load user statistics
      this.orderService.getMyOrders(0, 1).subscribe({
        next: (response) => {
          this.stats.totalOrders = response.totalElements;
          this.isLoading = false;
        }
      });
    }
  }
}
