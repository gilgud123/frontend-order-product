import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  route: string;
  requiresAuth: boolean;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isAuthenticated = signal(false);

  features = signal<FeatureCard[]>([
    {
      icon: '?',
      title: 'Product Catalog',
      description: 'Browse our extensive collection of products with detailed information and pricing.',
      route: '/products',
      requiresAuth: false
    },
    {
      icon: '?',
      title: 'Order Management',
      description: 'Create and track your orders with real-time status updates.',
      route: '/orders',
      requiresAuth: true
    },
    {
      icon: '?',
      title: 'Dashboard',
      description: 'View your personalized dashboard with statistics and quick actions.',
      route: '/dashboard',
      requiresAuth: true
    },
    {
      icon: '?',
      title: 'User Management',
      description: 'Manage users and their permissions (Admin only).',
      route: '/users',
      requiresAuth: true
    }
  ]);

  visibleFeatures = computed(() => {
    if (this.isAuthenticated()) {
      return this.features();
    }
    return this.features().filter(f => !f.requiresAuth);
  });

  constructor() {
    this.authService.isAuthenticated$.subscribe({
      next: (isAuth) => this.isAuthenticated.set(isAuth)
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  login(): void {
    this.router.navigate(['/auth/login']);
  }

  getStarted(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
