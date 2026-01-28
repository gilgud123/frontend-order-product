import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      sessionStorage.setItem('redirectUrl', state.url);
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // UserService is authenticated but doesn't have required role
    router.navigate(['/unauthorized']);
    return false;
  };
};

// Convenience guards for common roles
export const adminGuard: CanActivateFn = roleGuard(['ADMIN']);
export const userGuard: CanActivateFn = roleGuard(['USER', 'ADMIN']);
