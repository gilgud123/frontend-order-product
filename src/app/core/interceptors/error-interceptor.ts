import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage: string;

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = `Server Error: ${error.status} - ${error.message}`;

        // Handle specific HTTP error codes
        switch (error.status) {
          case 401:
            // Unauthorized - redirect to login
            console.error('Unauthorized access - redirecting to login');
            router.navigate(['/login']);
            break;
          case 403:
            // Forbidden - redirect to unauthorized page
            console.error('Access forbidden - redirecting to unauthorized page');
            router.navigate(['/unauthorized']);
            break;
          case 404:
            // Not Found
            console.error('Resource not found:', error.url);
            break;
          case 500:
          case 502:
          case 503:
            // Server errors
            console.error('Server error occurred:', error.message);
            break;
          default:
            console.error('HTTP Error:', error);
        }
      }

      // Log the error for debugging
      console.error('Error Interceptor:', errorMessage, error);

      // Return error observable
      return throwError(() => error);
    })
  );
};
