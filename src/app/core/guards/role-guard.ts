import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Factory function to create role-based guards.
 * Returns a guard that checks if user has any of the specified roles.
 *
 * @param allowedRoles - Array of role names that are allowed to access the route
 * @returns CanActivateFn guard function
 *
 * @example
 * // In routes:
 * { path: 'editor', canActivate: [roleGuard(['EDITOR', 'ADMIN'])] }
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // First check if authenticated
    if (!authService.isAuthenticated()) {
      sessionStorage.setItem('redirectUrl', state.url);
      router.navigate(['/login']);
      return false;
    }

    // Check if user has any of the allowed roles
    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // User is authenticated but doesn't have required role
    router.navigate(['/unauthorized']);
    return false;
  };
};

/**
 * Convenience guard for user role (USER or ADMIN).
 */
export const userGuard: CanActivateFn = roleGuard(['USER', 'ADMIN']);

