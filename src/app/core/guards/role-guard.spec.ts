import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard, userGuard } from './role-guard';
import { AuthService } from '../../auth/services/auth.service';

describe('roleGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'hasAnyRole']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('roleGuard factory', () => {
    it('should allow access when user has any of the required roles', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasAnyRole.and.returnValue(true);

      const guard = roleGuard(['EDITOR', 'ADMIN']);
      const result = TestBed.runInInjectionContext(() =>
        guard({ data: {} } as any, { url: '/editor' } as any)
      );

      expect(result).toBe(true);
      expect(authService.hasAnyRole).toHaveBeenCalledWith(['EDITOR', 'ADMIN']);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to unauthorized when user lacks all required roles', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasAnyRole.and.returnValue(false);

      const guard = roleGuard(['EDITOR', 'ADMIN']);
      const result = TestBed.runInInjectionContext(() =>
        guard({ data: {} } as any, { url: '/editor' } as any)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
    });

    it('should redirect to login when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      spyOn(sessionStorage, 'setItem');

      const guard = roleGuard(['EDITOR']);
      const result = TestBed.runInInjectionContext(() =>
        guard({ data: {} } as any, { url: '/editor' } as any)
      );

      expect(result).toBe(false);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('redirectUrl', '/editor');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('userGuard', () => {
    it('should check for USER or ADMIN role', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasAnyRole.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() =>
        userGuard({ data: {} } as any, { url: '/profile' } as any)
      );

      expect(result).toBe(true);
      expect(authService.hasAnyRole).toHaveBeenCalledWith(['USER', 'ADMIN']);
    });
  });
});

