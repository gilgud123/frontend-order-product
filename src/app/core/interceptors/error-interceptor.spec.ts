import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { errorInterceptor } from './error-interceptor';
import { throwError, of } from 'rxjs';

describe('errorInterceptor', () => {
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    spyOn(console, 'error');
  });

  it('should redirect to login on 401 error', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const next = jasmine.createSpy('next').and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, next).subscribe({
        error: () => {
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          expect(console.error).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('should redirect to unauthorized on 403 error', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });
    const next = jasmine.createSpy('next').and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, next).subscribe({
        error: () => {
          expect(router.navigate).toHaveBeenCalledWith(['/unauthorized']);
          expect(console.error).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('should log 404 errors without redirecting', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found', url: '/api/test' });
    const next = jasmine.createSpy('next').and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, next).subscribe({
        error: () => {
          expect(router.navigate).not.toHaveBeenCalled();
          expect(console.error).toHaveBeenCalledWith('Resource not found:', '/api/test');
          done();
        }
      });
    });
  });

  it('should log server errors (500, 502, 503)', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: 'Server crashed'
    });
    const next = jasmine.createSpy('next').and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, next).subscribe({
        error: () => {
          expect(console.error).toHaveBeenCalledWith('Server error occurred:', jasmine.any(String));
          done();
        }
      });
    });
  });

  it('should handle client-side errors', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const errorEvent = new ErrorEvent('Network error', { message: 'Connection failed' });
    const error = new HttpErrorResponse({ error: errorEvent, status: 0 });
    const next = jasmine.createSpy('next').and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, next).subscribe({
        error: () => {
          expect(console.error).toHaveBeenCalledWith(
            'Error Interceptor:',
            'Client Error: Connection failed',
            error
          );
          done();
        }
      });
    });
  });

  it('should pass through successful requests', (done) => {
    const req = new HttpRequest('GET', '/api/test');
    const response = new HttpResponse({ body: { data: 'success' }, status: 200 });
    const next = jasmine.createSpy('next').and.returnValue(of(response));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, next).subscribe({
        next: (res) => {
          expect(res).toEqual(response);
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });
});
