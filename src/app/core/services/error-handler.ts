import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Structured error interface
 */
export interface AppError {
  message: string;
  code?: string | number;
  severity: ErrorSeverity;
  timestamp: Date;
  details?: any;
}

/**
 * Global error handler service for centralized error handling,
 * logging, and user notification.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandler {
  private readonly router = inject(Router);

  /**
   * Handle HTTP errors
   */
  handleHttpError(error: HttpErrorResponse): AppError {
    const appError: AppError = {
      message: this.getHttpErrorMessage(error),
      code: error.status,
      severity: this.getHttpErrorSeverity(error.status),
      timestamp: new Date(),
      details: error
    };

    this.logError(appError);
    this.handleErrorAction(appError);

    return appError;
  }

  /**
   * Handle general application errors
   */
  handleError(error: Error | string, severity: ErrorSeverity = ErrorSeverity.ERROR): AppError {
    const appError: AppError = {
      message: typeof error === 'string' ? error : error.message,
      severity,
      timestamp: new Date(),
      details: typeof error === 'string' ? undefined : error
    };

    this.logError(appError);

    return appError;
  }

  /**
   * Log error to console (can be extended to send to logging service)
   */
  private logError(error: AppError): void {
    const prefix = `[${error.severity.toUpperCase()}] ${error.timestamp.toISOString()}`;

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.ERROR:
        console.error(prefix, error.message, error.details);
        break;
      case ErrorSeverity.WARNING:
        console.warn(prefix, error.message, error.details);
        break;
      case ErrorSeverity.INFO:
        console.info(prefix, error.message, error.details);
        break;
    }
  }

  /**
   * Get user-friendly error message from HTTP error
   */
  private getHttpErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      return `Client Error: ${error.error.message}`;
    }

    // Server-side error
    if (error.error?.message) {
      return error.error.message;
    }

    switch (error.status) {
      case 0:
        return 'Unable to connect to server. Please check your internet connection.';
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `Server error: ${error.status} - ${error.statusText}`;
    }
  }

  /**
   * Determine error severity from HTTP status code
   */
  private getHttpErrorSeverity(status: number): ErrorSeverity {
    if (status === 0) {
      return ErrorSeverity.CRITICAL;
    }
    if (status >= 500) {
      return ErrorSeverity.CRITICAL;
    }
    if (status >= 400) {
      return ErrorSeverity.ERROR;
    }
    if (status >= 300) {
      return ErrorSeverity.WARNING;
    }
    return ErrorSeverity.INFO;
  }

  /**
   * Handle error-specific actions (navigation, notifications, etc.)
   */
  private handleErrorAction(error: AppError): void {
    // Handle specific error codes
    if (error.code === 401) {
      // Already handled by errorInterceptor, but can add additional logic here
      console.log('Unauthorized error - user will be redirected to login');
    } else if (error.code === 403) {
      // Already handled by errorInterceptor
      console.log('Forbidden error - user will be redirected to unauthorized page');
    }

    // Can be extended to show toast notifications, modals, etc.
  }

  /**
   * Get user-friendly error message for display
   */
  getUserMessage(error: AppError): string {
    return error.message;
  }

  /**
   * Check if error is critical
   */
  isCritical(error: AppError): boolean {
    return error.severity === ErrorSeverity.CRITICAL;
  }
}


