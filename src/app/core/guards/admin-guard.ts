import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Admin guard to protect routes requiring admin role.
 * Checks authentication first, then verifies ADMIN role.
 * Redirects to unauthorized if user lacks admin privileges.
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if authenticated
  if (!authService.isAuthenticated()) {
    sessionStorage.setItem('redirectUrl', state.url);
    router.navigate(['/login']);
    return false;
  }

  // Check for admin role
  if (authService.hasRole('ADMIN')) {
    return true;
  }

  // User is authenticated but doesn't have required role
  router.navigate(['/unauthorized']);
  return false;
};
