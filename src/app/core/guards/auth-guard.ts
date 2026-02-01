import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Auth guard to protect routes requiring authentication.
 * Redirects to login if user is not authenticated.
 * Stores attempted URL for post-login redirect.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  sessionStorage.setItem('redirectUrl', state.url);

  // Redirect to login
  router.navigate(['/login']);
  return false;
};
