import { Routes } from '@angular/router';
import { authGuard } from './auth';
import { adminGuard } from './auth';

// Lazy load pages
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'callback',
    loadComponent: () => import('./auth/components/callback/callback.component').then(m => m.CallbackComponent)
  },
  {
    path: 'logout',
    loadComponent: () => import('./auth/components/logout/logout.component').then(m => m.LogoutComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },

  // Protected routes - require authentication
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Product routes
  {
    path: 'products',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'new',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: ':id/edit',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      }
    ]
  },

  // User routes (admin only)
  {
    path: 'users',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/users/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/users/user-form/user-form.component').then(m => m.UserFormComponent)
      }
    ]
  },

  // User profile (own profile)
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/users/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },

  // Order routes
  {
    path: 'orders',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/orders/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: 'my-orders',
        loadComponent: () => import('./pages/orders/my-orders/my-orders.component').then(m => m.MyOrdersComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/orders/create-order/create-order.component').then(m => m.CreateOrderComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      },
      {
        path: 'customer/:customerId/revenue',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/orders/customer-revenue/customer-revenue.component').then(m => m.CustomerRevenueComponent)
      }
    ]
  },

  // 404 - must be last
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
