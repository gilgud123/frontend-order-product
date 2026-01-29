import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderListComponent } from './order-list.component';
import { OrderService } from '../../../services/order.service';
import { of, throwError } from 'rxjs';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import { OrderDTO } from '../../../models/order.model';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let mockOrderService: jasmine.SpyObj<OrderService>;

  const mockOrdersResponse: PaginatedResponse<OrderDTO> = {
    content: [
      { id: 1, userId: 100, productIds: [1, 2], totalAmount: 150.00, status: 'PENDING', createdAt: '2024-01-15T10:00:00Z' },
      { id: 2, userId: 101, productIds: [3], totalAmount: 75.50, status: 'SHIPPED', createdAt: '2024-01-16T14:30:00Z' }
    ],
    totalElements: 50,
    totalPages: 5,
    size: 10,
    number: 0,
    first: true,
    last: false,
    empty: false
  };

  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', [
      'getAll',
      'getByStatus',
      'getByUserId',
      'updateStatus',
      'delete'
    ]);

    mockOrderService.getAll.and.returnValue(of(mockOrdersResponse));

    await TestBed.configureTestingModule({
      imports: [OrderListComponent],
      providers: [
        { provide: OrderService, useValue: mockOrderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load orders on init', () => {
      fixture.detectChanges();
      expect(mockOrderService.getAll).toHaveBeenCalledWith(0, 10);
      expect(component.orders().length).toBe(2);
    });

    it('should initialize with default values', () => {
      expect(component.currentPage()).toBe(0);
      expect(component.pageSize()).toBe(10);
      expect(component.selectedStatus()).toBe('ALL');
      expect(component.searchUserId()).toBe('');
    });
  });

  describe('Loading Orders', () => {
    it('should set loading state while fetching orders', () => {
      fixture.detectChanges();
      expect(component.isLoading()).toBe(false);
    });

    it('should update pagination info from response', () => {
      fixture.detectChanges();
      expect(component.totalElements()).toBe(50);
      expect(component.totalPages()).toBe(5);
    });

    it('should handle error when loading orders fails', () => {
      mockOrderService.getAll.and.returnValue(throwError(() => new Error('Load failed')));
      fixture.detectChanges();
      expect(component.error()).toBe('Failed to load orders. Please try again.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter by status', () => {
      mockOrderService.getByStatus.and.returnValue(of(mockOrdersResponse));
      component.selectedStatus.set('PENDING');
      component.onStatusFilterChange();
      expect(mockOrderService.getByStatus).toHaveBeenCalledWith('PENDING', 0, 10);
      expect(component.currentPage()).toBe(0);
    });

    it('should filter by user ID', () => {
      mockOrderService.getByUserId.and.returnValue(of(mockOrdersResponse));
      component.searchUserId.set('100');
      component.onUserIdSearch();
      expect(mockOrderService.getByUserId).toHaveBeenCalledWith(100, 0, 10);
    });

    it('should handle invalid user ID', () => {
      component.searchUserId.set('invalid');
      component.onUserIdSearch();
      expect(mockOrderService.getAll).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should go to next page', () => {
      component.nextPage();
      expect(component.currentPage()).toBe(1);
      expect(mockOrderService.getAll).toHaveBeenCalledWith(1, 10);
    });

    it('should go to previous page', () => {
      component.currentPage.set(2);
      component.previousPage();
      expect(component.currentPage()).toBe(1);
    });

    it('should not go to previous page when on first page', () => {
      component.previousPage();
      expect(component.currentPage()).toBe(0);
    });

    it('should go to specific page', () => {
      component.goToPage(3);
      expect(component.currentPage()).toBe(3);
    });

    it('should compute hasPreviousPage correctly', () => {
      expect(component.hasPreviousPage()).toBe(false);
      component.currentPage.set(1);
      expect(component.hasPreviousPage()).toBe(true);
    });

    it('should compute hasNextPage correctly', () => {
      expect(component.hasNextPage()).toBe(true);
      component.currentPage.set(4);
      expect(component.hasNextPage()).toBe(false);
    });
  });

  describe('Order Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should update order status', () => {
      mockOrderService.updateStatus.and.returnValue(of({ id: 1, userId: 100, productIds: [], status: 'SHIPPED' }));
      component.updateOrderStatus(1, 'SHIPPED');
      expect(mockOrderService.updateStatus).toHaveBeenCalledWith(1, 'SHIPPED');
    });

    it('should not update status if user cancels', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.updateOrderStatus(1, 'SHIPPED');
      expect(mockOrderService.updateStatus).not.toHaveBeenCalled();
    });

    it('should delete order', () => {
      mockOrderService.delete.and.returnValue(of(undefined));
      component.deleteOrder(1);
      expect(mockOrderService.delete).toHaveBeenCalledWith(1);
    });

    it('should handle error when deleting order', () => {
      mockOrderService.delete.and.returnValue(throwError(() => new Error('Delete failed')));
      component.deleteOrder(1);
      expect(component.error()).toBe('Failed to delete order.');
    });
  });

  describe('Helper Methods', () => {
    it('should return correct status class', () => {
      expect(component.getStatusClass('PENDING')).toBe('status-pending');
      expect(component.getStatusClass('PROCESSING')).toBe('status-processing');
      expect(component.getStatusClass('SHIPPED')).toBe('status-shipped');
      expect(component.getStatusClass('DELIVERED')).toBe('status-delivered');
      expect(component.getStatusClass('CANCELLED')).toBe('status-cancelled');
      expect(component.getStatusClass('UNKNOWN')).toBe('status-unknown');
    });

    it('should format date correctly', () => {
      const formatted = component.formatDate('2024-01-15T10:00:00Z');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
    });

    it('should format currency correctly', () => {
      expect(component.formatCurrency(150.50)).toBe('$150.50');
      expect(component.formatCurrency(0)).toBe('$0.00');
      expect(component.formatCurrency(undefined)).toBe('$0.00');
    });
  });

  describe('Computed Values', () => {
    it('should compute hasOrders correctly', () => {
      expect(component.hasOrders()).toBe(false);
      fixture.detectChanges();
      expect(component.hasOrders()).toBe(true);
    });
  });
});
