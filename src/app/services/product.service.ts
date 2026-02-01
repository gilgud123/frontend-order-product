import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductDTO } from '../models/product.model';
import { PaginatedResponse } from '../shared';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/products';

  /**
   * Get all products with pagination
   * GET /api/products?page={page}&size={size}
   */
  getAll(page = 0, size = 10): Observable<PaginatedResponse<ProductDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<ProductDTO>>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get product by ID
   * GET /api/products/{id}
   */
  getById(id: number): Observable<ProductDTO> {
    return this.http.get<ProductDTO>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Search products by query string
   * GET /api/products/search?query={query}&page={page}&size={size}
   */
  search(query: string, page = 0, size = 10): Observable<PaginatedResponse<ProductDTO>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<ProductDTO>>(`${this.API_URL}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Filter products by criteria
   * GET /api/products/filter?category={category}&minPrice={minPrice}&maxPrice={maxPrice}&page={page}&size={size}
   */
  filter(
    filters: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    },
    page = 0,
    size = 10
  ): Observable<PaginatedResponse<ProductDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      params = params.set('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }

    return this.http.get<PaginatedResponse<ProductDTO>>(`${this.API_URL}/filter`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get products by category
   * GET /api/products/category/{category}?page={page}&size={size}
   */
  getByCategory(category: string, page = 0, size = 10): Observable<PaginatedResponse<ProductDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<ProductDTO>>(`${this.API_URL}/category/${category}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get low stock products
   * GET /api/products/low-stock?threshold={threshold}
   */
  getLowStock(threshold = 10): Observable<ProductDTO[]> {
    const params = new HttpParams().set('threshold', threshold.toString());
    return this.http.get<ProductDTO[]>(`${this.API_URL}/low-stock`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new product (admin only)
   * POST /api/products
   */
  create(product: ProductDTO): Observable<ProductDTO> {
    return this.http.post<ProductDTO>(this.API_URL, product)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update existing product (admin only)
   * PUT /api/products/{id}
   */
  update(id: number, product: ProductDTO): Observable<ProductDTO> {
    return this.http.put<ProductDTO>(`${this.API_URL}/${id}`, product)
      .pipe(catchError(this.handleError));
  }

  /**
   * Partially update product (admin only)
   * PATCH /api/products/{id}
   */
  partialUpdate(id: number, updates: Partial<ProductDTO>): Observable<ProductDTO> {
    return this.http.patch<ProductDTO>(`${this.API_URL}/${id}`, updates)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete product (admin only)
   * DELETE /api/products/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Bulk delete products (admin only)
   * DELETE /api/products/bulk?ids={id1,id2,id3}
   */
  bulkDelete(ids: number[]): Observable<void> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.delete<void>(`${this.API_URL}/bulk`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Update product stock quantity
   * PATCH /api/products/{id}/stock?quantity={quantity}
   */
  updateStock(id: number, quantity: number): Observable<ProductDTO> {
    const params = new HttpParams().set('quantity', quantity.toString());
    return this.http.patch<ProductDTO>(`${this.API_URL}/${id}/stock`, null, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('ProductService Error:', error);
    throw error;
  }
}