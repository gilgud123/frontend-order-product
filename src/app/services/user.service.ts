import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserDTO } from '../models/user.model';
import { PaginatedResponse } from '../shared/models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/users';

  /**
   * Get all users with pagination (admin only)
   * GET /api/users?page={page}&size={size}
   */
  getAll(page: number = 0, size: number = 10): Observable<PaginatedResponse<UserDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<UserDTO>>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get user by ID
   * GET /api/users/{id}
   */
  getById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Search users by query string (admin only)
   * GET /api/users/search?query={query}&page={page}&size={size}
   */
  search(query: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<UserDTO>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<UserDTO>>(`${this.API_URL}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get user by username
   * GET /api/users/username/{username}
   */
  getByUsername(username: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.API_URL}/username/${username}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get user by email
   * GET /api/users/email?email={email}
   */
  getByEmail(email: string): Observable<UserDTO> {
    const params = new HttpParams().set('email', email);
    return this.http.get<UserDTO>(`${this.API_URL}/email`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get current user profile
   * GET /api/users/me
   */
  getCurrentUser(): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.API_URL}/me`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new user (admin only)
   * POST /api/users
   */
  create(user: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.API_URL, user)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update existing user
   * PUT /api/users/{id}
   */
  update(id: number, user: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.API_URL}/${id}`, user)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update current user profile
   * PATCH /api/users/me
   */
  updateProfile(updates: Partial<UserDTO>): Observable<UserDTO> {
    return this.http.patch<UserDTO>(`${this.API_URL}/me`, updates)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete user (admin only)
   * DELETE /api/users/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if username exists
   * GET /api/users/exists/username/{username}
   */
  usernameExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/exists/username/${username}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check if email exists
   * GET /api/users/exists/email?email={email}
   */
  emailExists(email: string): Observable<boolean> {
    const params = new HttpParams().set('email', email);
    return this.http.get<boolean>(`${this.API_URL}/exists/email`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get users by role (admin only)
   * GET /api/users/role/{role}?page={page}&size={size}
   */
  getByRole(role: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<UserDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<UserDTO>>(`${this.API_URL}/role/${role}`, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('UserService Error:', error);
    throw error;
  }
}
