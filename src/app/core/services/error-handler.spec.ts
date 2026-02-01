import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ErrorHandler, ErrorSeverity } from './error-handler';

describe('ErrorHandler', () => {
  let service: ErrorHandler;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(ErrorHandler);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    spyOn(console, 'error');
    spyOn(console, 'warn');
    spyOn(console, 'info');
  });

  describe('handleHttpError', () => {
    it('should handle 401 unauthorized error', () => {
      const httpError = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized'
      });

      const appError = service.handleHttpError(httpError);

      expect(appError.code).toBe(401);
      expect(appError.severity).toBe(ErrorSeverity.ERROR);
      expect(appError.message).toContain('Unauthorized');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle 403 forbidden error', () => {
      const httpError = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden'
      });

      const appError = service.handleHttpError(httpError);

      expect(appError.code).toBe(403);
      expect(appError.message).toContain('Access denied');
    });

    it('should handle 404 not found error', () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found'
      });

      const appError = service.handleHttpError(httpError);

      expect(appError.code).toBe(404);
      expect(appError.message).toContain('Resource not found');
    });

    it('should handle 500 server error', () => {
      const httpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });

      const appError = service.handleHttpError(httpError);

      expect(appError.code).toBe(500);
      expect(appError.severity).toBe(ErrorSeverity.CRITICAL);
      expect(appError.message).toContain('Internal server error');
    });

    it('should handle network error (status 0)', () => {
      const httpError = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error'
      });

      const appError = service.handleHttpError(httpError);

      expect(appError.code).toBe(0);
      expect(appError.severity).toBe(ErrorSeverity.CRITICAL);
      expect(appError.message).toContain('Unable to connect');
    });

    it('should handle client-side errors', () => {
      const errorEvent = new ErrorEvent('Network error', {
        message: 'Connection timeout'
      });
      const httpError = new HttpErrorResponse({
        error: errorEvent,
        status: 0
      });

      const appError = service.handleHttpError(httpError);

      expect(appError.message).toContain('Client Error');
      expect(appError.message).toContain('Connection timeout');
    });

    it('should use server error message when available', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: { message: 'Custom validation error' }
      });

      const appError = service.handleHttpError(httpError);

      expect(appError.message).toBe('Custom validation error');
    });
  });

  describe('handleError', () => {
    it('should handle Error object', () => {
      const error = new Error('Something went wrong');

      const appError = service.handleError(error);

      expect(appError.message).toBe('Something went wrong');
      expect(appError.severity).toBe(ErrorSeverity.ERROR);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle string error', () => {
      const appError = service.handleError('Custom error message');

      expect(appError.message).toBe('Custom error message');
      expect(appError.severity).toBe(ErrorSeverity.ERROR);
    });

    it('should handle warning severity', () => {
      const appError = service.handleError('Warning message', ErrorSeverity.WARNING);

      expect(appError.severity).toBe(ErrorSeverity.WARNING);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle info severity', () => {
      const appError = service.handleError('Info message', ErrorSeverity.INFO);

      expect(appError.severity).toBe(ErrorSeverity.INFO);
      expect(console.info).toHaveBeenCalled();
    });

    it('should include timestamp', () => {
      const before = new Date();
      const appError = service.handleError('Test error');
      const after = new Date();

      expect(appError.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(appError.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('getUserMessage', () => {
    it('should return user-friendly message', () => {
      const httpError = new HttpErrorResponse({ status: 404 });
      const appError = service.handleHttpError(httpError);

      const message = service.getUserMessage(appError);

      expect(message).toBe(appError.message);
      expect(message).toContain('Resource not found');
    });
  });

  describe('isCritical', () => {
    it('should identify critical errors', () => {
      const httpError = new HttpErrorResponse({ status: 500 });
      const appError = service.handleHttpError(httpError);

      expect(service.isCritical(appError)).toBe(true);
    });

    it('should identify non-critical errors', () => {
      const httpError = new HttpErrorResponse({ status: 400 });
      const appError = service.handleHttpError(httpError);

      expect(service.isCritical(appError)).toBe(false);
    });
  });

  describe('error severity determination', () => {
    it('should classify 4xx as ERROR', () => {
      const httpError = new HttpErrorResponse({ status: 400 });
      const appError = service.handleHttpError(httpError);
      expect(appError.severity).toBe(ErrorSeverity.ERROR);
    });

    it('should classify 5xx as CRITICAL', () => {
      const httpError = new HttpErrorResponse({ status: 503 });
      const appError = service.handleHttpError(httpError);
      expect(appError.severity).toBe(ErrorSeverity.CRITICAL);
    });
  });
});

