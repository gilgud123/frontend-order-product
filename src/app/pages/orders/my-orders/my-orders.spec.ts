import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyOrdersComponent } from './my-orders.component';
import { OrderService } from '../../../services/order.service';
import { of, throwError } from 'rxjs';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import { OrderDTO } from '../../../models/order.model';

describe('MyOrdersComponent', () => {
  let component: MyOrdersComponent;
  let fixture: ComponentFixture<MyOrdersComponent>;
  let mockOrderService: jasmine.SpyObj<OrderService>;

  const mockOrdersResponse: PaginatedResponse<OrderDTO> = {
    content: [
      { id: 1, userId: 100, productIds: [1, 2], totalAmount: 150.00, status: 'PENDING', createdAt: '2024-01-15T10:00:00Z' },
      { id: 2, userId: 100, productIds: [3], totalAmount: 75.50, status: 'DELIVERED', createdAt: '2024-01-16T14:30:00Z' }
    ],
    totalElements: 10,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false
  };

  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', ['getMyOrders', 'cancel']);
    mockOrderService.getMyOrders.and.returnValue(of(mockOrdersResponse));

    await TestBed.configureTestingModule({
      imports: [MyOrdersComponent],
      providers: [
        { provide: OrderService, useValue: mockOrderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyOrdersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load user orders on init', () => {
      fixture.detectChanges();
      expect(mockOrderService.getMyOrders).toHaveBeenCalledWith(0, 10);
      expect(component.orders().length).toBe(2);
    });

    it('should initialize with default values', () => {
      expect(component.currentPage()).toBe(0);
      expect(component.pageSize()).toBe(10);
    });
  });

  describe('Loading Orders', () => {
    it('should set loading state correctly', () => {
      expect(component.isLoading()).toBe(false);
      fixture.detectChanges();
      expect(component.isLoading()).toBe(false);
    });

    it('should update pagination info', () => {
      fixture.detectChanges();
      expect(component.totalElements()).toBe(10);
      expect(component.totalPages()).toBe(1);
    });

    it('should handle error when loading fails', () => {
      mockOrderService.getMyOrders.and.returnValue(throwError(() => new Error('Load failed')));
      fixture.detectChanges();
      expect(component.error()).toBe('Failed to load your orders. Please try again.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Cancel Order', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should cancel order successfully', () => {
      mockOrderService.cancel.and.returnValue(of({ id: 1, userId: 100, productIds: [], status: 'CANCELLED' }));
      component.cancelOrder(1);
      expect(mockOrderService.cancel).toHaveBeenCalledWith(1);
      expect(mockOrderService.getMyOrders).toHaveBeenCalled();
    });

    it('should not cancel if user declines confirmation', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.cancelOrder(1);
      expect(mockOrderService.cancel).not.toHaveBeenCalled();
    });

    it('should handle error when canceling fails', () => {
      mockOrderService.cancel.and.returnValue(throwError(() => new Error('Cancel failed')));
      component.cancelOrder(1);
      expect(component.error()).toBe('Failed to cancel order. Please try again.');
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.totalPages.set(3);
    });

    it('should go to next page', () => {
      component.nextPage();
      expect(component.currentPage()).toBe(1);
    });

    it('should go to previous page', () => {
      component.currentPage.set(1);
      component.previousPage();
      expect(component.currentPage()).toBe(0);
    });

    it('should not go beyond last page', () => {
      component.currentPage.set(2);
      component.nextPage();
      expect(component.currentPage()).toBe(2);
    });

    it('should go to specific page', () => {
      component.goToPage(2);
      expect(component.currentPage()).toBe(2);
    });
  });

  describe('Helper Methods', () => {
    it('should return correct status class', () => {
      expect(component.getStatusClass('PENDING')).toBe('status-pending');
      expect(component.getStatusClass('PROCESSING')).toBe('status-processing');
      expect(component.getStatusClass('SHIPPED')).toBe('status-shipped');
      expect(component.getStatusClass('DELIVERED')).toBe('status-delivered');
      expect(component.getStatusClass('CANCELLED')).toBe('status-cancelled');
    });

    it('should determine if order can be cancelled', () => {
      expect(component.canCancelOrder('PENDING')).toBe(true);
      expect(component.canCancelOrder('PROCESSING')).toBe(true);
      expect(component.canCancelOrder('SHIPPED')).toBe(false);
      expect(component.canCancelOrder('DELIVERED')).toBe(false);
      expect(component.canCancelOrder('CANCELLED')).toBe(false);
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

    it('should compute hasPreviousPage correctly', () => {
      expect(component.hasPreviousPage()).toBe(false);
      component.currentPage.set(1);
      expect(component.hasPreviousPage()).toBe(true);
    });

    it('should compute hasNextPage correctly', () => {
      component.totalPages.set(3);
      expect(component.hasNextPage()).toBe(true);
      component.currentPage.set(2);
      expect(component.hasNextPage()).toBe(false);
    });
  });

  describe('Template Rendering', () => {
    it('should display orders in the template', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.order-card')).toBeTruthy();
    });

    it('should show empty state when no orders', () => {
      mockOrderService.getMyOrders.and.returnValue(of({
        ...mockOrdersResponse,
        content: [],
        totalElements: 0,
        empty: true
      }));
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.empty-state')).toBeTruthy();
    });
  });
});
