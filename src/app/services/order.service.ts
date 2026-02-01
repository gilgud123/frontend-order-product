import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderDTO } from '../models/order.model';
import { CustomerRevenueDTO } from '../models/customer-revenue.model';
import { PaginatedResponse } from '../shared/models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/orders';

  /**
   * Get all orders with pagination (admin only)
   * GET /api/orders?page={page}&size={size}
   */
  getAll(page = 0, size = 10): Observable<PaginatedResponse<OrderDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<OrderDTO>>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get order by ID
   * GET /api/orders/{id}
   */
  getById(id: number): Observable<OrderDTO> {
    return this.http.get<OrderDTO>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get orders by user ID
   * GET /api/orders/user/{userId}?page={page}&size={size}
   */
  getByUserId(userId: number, page = 0, size = 10): Observable<PaginatedResponse<OrderDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<OrderDTO>>(`${this.API_URL}/user/${userId}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get current user's orders
   * GET /api/orders/my-orders?page={page}&size={size}
   */
  getMyOrders(page = 0, size = 10): Observable<PaginatedResponse<OrderDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<OrderDTO>>(`${this.API_URL}/my-orders`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get orders by status
   * GET /api/orders/status?status={status}&page={page}&size={size}
   */
  getByStatus(status: string, page = 0, size = 10): Observable<PaginatedResponse<OrderDTO>> {
    const params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<OrderDTO>>(`${this.API_URL}/status`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get orders by date range
   * GET /api/orders/date-range?startDate={startDate}&endDate={endDate}&page={page}&size={size}
   */
  getByDateRange(
    startDate: string,
    endDate: string,
    page = 0,
    size = 10
  ): Observable<PaginatedResponse<OrderDTO>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<OrderDTO>>(`${this.API_URL}/date-range`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new order
   * POST /api/orders
   */
  create(order: OrderDTO): Observable<OrderDTO> {
    return this.http.post<OrderDTO>(this.API_URL, order)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update order
   * PUT /api/orders/{id}
   */
  update(id: number, order: OrderDTO): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.API_URL}/${id}`, order)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update order status (admin only)
   * PATCH /api/orders/{id}/status?status={status}
   */
  updateStatus(id: number, status: string): Observable<OrderDTO> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<OrderDTO>(`${this.API_URL}/${id}/status`, null, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Cancel order
   * PATCH /api/orders/{id}/cancel
   */
  cancel(id: number): Observable<OrderDTO> {
    return this.http.patch<OrderDTO>(`${this.API_URL}/${id}/cancel`, null)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete order (admin only)
   * DELETE /api/orders/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get customer revenue by customer ID
   * GET /api/orders/customer/{customerId}/revenue
   */
  getCustomerRevenue(customerId: number): Observable<CustomerRevenueDTO[]> {
    return this.http.get<CustomerRevenueDTO[]>(`${this.API_URL}/customer/${customerId}/revenue`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get order statistics (admin only)
   * GET /api/orders/statistics
   */
  getStatistics(): Observable<OrderStatistics> {
    return this.http.get<OrderStatistics>(`${this.API_URL}/statistics`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get total revenue (admin only)
   * GET /api/orders/revenue/total
   */
  getTotalRevenue(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/revenue/total`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get revenue by date range (admin only)
   * GET /api/orders/revenue/range?startDate={startDate}&endDate={endDate}
   */
  getRevenueByDateRange(startDate: string, endDate: string): Observable<number> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<number>(`${this.API_URL}/revenue/range`, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('OrderService Error:', error);
    throw error;
  }
}

// Supporting interface
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}
