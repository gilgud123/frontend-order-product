import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../../auth/services/auth.service';
import { of } from 'rxjs';

describe('authInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let mockHandler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getAccessToken']);
    mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
    mockHandler.handle.and.returnValue(of({} as any));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should add Authorization header when token exists and URL contains /api/', () => {
    const token = 'test-token-123';
    authService.getAccessToken.and.returnValue(token);

    const req = new HttpRequest('GET', 'https://example.com/api/users');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, mockHandler.handle.bind(mockHandler));
    });

    const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should not add Authorization header when token is null', () => {
    authService.getAccessToken.and.returnValue(null);

    const req = new HttpRequest('GET', 'https://example.com/api/users');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, mockHandler.handle.bind(mockHandler));
    });

    const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(modifiedRequest.headers.has('Authorization')).toBe(false);
  });

  it('should not add Authorization header when URL does not contain /api/', () => {
    const token = 'test-token-123';
    authService.getAccessToken.and.returnValue(token);

    const req = new HttpRequest('GET', 'https://example.com/public/data');

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, mockHandler.handle.bind(mockHandler));
    });

    const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(modifiedRequest.headers.has('Authorization')).toBe(false);
  });
});
