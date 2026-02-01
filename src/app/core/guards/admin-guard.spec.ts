import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin-guard';
import { AuthService } from '../../auth/services/auth.service';

describe('adminGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'hasRole']);
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

  it('should allow access when user is authenticated and has ADMIN role', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.hasRole.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({ data: {} } as any, { url: '/users' } as any)
    );

    expect(result).toBe(true);
    expect(authService.hasRole).toHaveBeenCalledWith('ADMIN');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to unauthorized when user is authenticated but lacks ADMIN role', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.hasRole.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({ data: {} } as any, { url: '/users' } as any)
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should redirect to login when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    spyOn(sessionStorage, 'setItem');

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({ data: {} } as any, { url: '/users' } as any)
    );

    expect(result).toBe(false);
    expect(sessionStorage.setItem).toHaveBeenCalledWith('redirectUrl', '/users');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
