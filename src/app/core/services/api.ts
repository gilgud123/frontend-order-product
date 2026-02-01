import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * API configuration and utilities service.
 * Provides centralized API URL management and common HTTP utilities.
 */
@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly http = inject(HttpClient);

  // Base API URL - can be configured via environment
  private readonly baseUrl = '/api';

  /**
   * Get the base API URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Build full API URL from endpoint
   */
  buildUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Build HttpParams from object
   */
  buildParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          // Handle array parameters
          value.forEach(item => {
            httpParams = httpParams.append(key, String(item));
          });
        } else {
          httpParams = httpParams.set(key, String(value));
        }
      }
    });

    return httpParams;
  }

  /**
   * Create standard headers
   */
  buildHeaders(additionalHeaders?: Record<string, string>): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (additionalHeaders) {
      Object.keys(additionalHeaders).forEach(key => {
        headers = headers.set(key, additionalHeaders[key]);
      });
    }

    return headers;
  }

  /**
   * Generic GET request
   */
  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = params ? this.buildParams(params) : undefined;

    return this.http.get<T>(url, { params: httpParams });
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, body: any, params?: Record<string, any>): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = params ? this.buildParams(params) : undefined;

    return this.http.post<T>(url, body, { params: httpParams });
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, body: any, params?: Record<string, any>): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = params ? this.buildParams(params) : undefined;

    return this.http.put<T>(url, body, { params: httpParams });
  }

  /**
   * Generic PATCH request
   */
  patch<T>(endpoint: string, body: any, params?: Record<string, any>): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = params ? this.buildParams(params) : undefined;

    return this.http.patch<T>(url, body, { params: httpParams });
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpParams = params ? this.buildParams(params) : undefined;

    return this.http.delete<T>(url, { params: httpParams });
  }

  /**
   * Check if the API is available (health check)
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }
}


