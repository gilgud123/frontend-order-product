import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderDetailComponent } from './order-detail.component';
import { OrderService, ProductService } from '../../../services';
import { AuthService } from '../../../auth';
import { of, throwError } from 'rxjs';
import { OrderDTO } from '../../../models/order.model';
import { ProductDTO } from '../../../models/product.model';

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let fixture: ComponentFixture<OrderDetailComponent>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockOrder: OrderDTO = {
    id: 1,
    userId: 100,
    productIds: [1, 2],
    totalAmount: 150.00,
    status: 'PENDING',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  };

  const mockProducts: ProductDTO[] = [
    { id: 1, name: 'Product 1', price: 75.00, stockQuantity: 10, description: 'Test product 1' },
    { id: 2, name: 'Product 2', price: 75.00, stockQuantity: 5, description: 'Test product 2' }
  ];

  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', ['getById', 'updateStatus', 'cancel', 'delete']);
    mockProductService = jasmine.createSpyObj('ProductService', ['getById']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockOrderService.getById.and.returnValue(of(mockOrder));
    mockProductService.getById.and.returnValues(of(mockProducts[0]), of(mockProducts[1]));
    mockAuthService.hasRole.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (_key: string) => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load order details on init', () => {
      fixture.detectChanges();
      expect(mockOrderService.getById).toHaveBeenCalledWith(1);
      expect(component.order()).toEqual(mockOrder);
    });

    it('should load products after loading order', (done) => {
      fixture.detectChanges();
      setTimeout(() => {
        expect(mockProductService.getById).toHaveBeenCalledTimes(2);
        expect(component.products().length).toBe(2);
        done();
      }, 100);
    });

    it('should handle invalid order ID', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [OrderDetailComponent],
        providers: [
          { provide: OrderService, useValue: mockOrderService },
          { provide: ProductService, useValue: mockProductService },
          { provide: AuthService, useValue: mockAuthService },
          { provide: Router, useValue: mockRouter },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: {
                  get: (_key: string) => null
                }
              }
            }
          }
        ]
      });
      const newFixture = TestBed.createComponent(OrderDetailComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      expect(newComponent.error()).toBe('Invalid order ID');
    });

    it('should handle error when loading order fails', () => {
      mockOrderService.getById.and.returnValue(throwError(() => new Error('Load failed')));
      fixture.detectChanges();
      expect(component.error()).toBe('Failed to load order details. Please try again.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Update Status', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should update order status', () => {
      const updatedOrder = { ...mockOrder, status: 'SHIPPED' };
      mockOrderService.updateStatus.and.returnValue(of(updatedOrder));
      component.updateStatus('SHIPPED');
      expect(mockOrderService.updateStatus).toHaveBeenCalledWith(1, 'SHIPPED');
      expect(component.order()?.status).toBe('SHIPPED');
    });

    it('should not update if user cancels', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.updateStatus('SHIPPED');
      expect(mockOrderService.updateStatus).not.toHaveBeenCalled();
    });

    it('should handle error when updating status fails', () => {
      mockOrderService.updateStatus.and.returnValue(throwError(() => new Error('Update failed')));
      component.updateStatus('SHIPPED');
      expect(component.error()).toBe('Failed to update order status.');
    });
  });

  describe('Cancel Order', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should cancel order', () => {
      const cancelledOrder = { ...mockOrder, status: 'CANCELLED' };
      mockOrderService.cancel.and.returnValue(of(cancelledOrder));
      component.cancelOrder();
      expect(mockOrderService.cancel).toHaveBeenCalledWith(1);
      expect(component.order()?.status).toBe('CANCELLED');
    });

    it('should handle error when canceling fails', () => {
      mockOrderService.cancel.and.returnValue(throwError(() => new Error('Cancel failed')));
      component.cancelOrder();
      expect(component.error()).toBe('Failed to cancel order.');
    });
  });

  describe('Delete Order', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should delete order and navigate away', () => {
      mockOrderService.delete.and.returnValue(of(undefined));
      component.deleteOrder();
      expect(mockOrderService.delete).toHaveBeenCalledWith(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders']);
    });

    it('should handle error when deleting fails', () => {
      mockOrderService.delete.and.returnValue(throwError(() => new Error('Delete failed')));
      component.deleteOrder();
      expect(component.error()).toBe('Failed to delete order.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate back to orders list', () => {
      fixture.detectChanges();
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders']);
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

    it('should format date correctly', () => {
      const formatted = component.formatDate('2024-01-15T10:00:00Z');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
    });

    it('should format currency correctly', () => {
      expect(component.formatCurrency(150.50)).toBe('$150.50');
      expect(component.formatCurrency(0)).toBe('$0.00');
      expect(component.formatCurrency(undefined)).toBe('$0.00');
    });
  });

  describe('Computed Values', () => {
    it('should compute hasOrder correctly', () => {
      expect(component.hasOrder()).toBe(false);
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.hasOrder()).toBe(true);
      }, 100);
    });

    it('should compute isAdmin correctly', () => {
      mockAuthService.hasRole.and.returnValue(true);
      fixture.detectChanges();
      expect(component.isAdmin()).toBe(true);
    });

    it('should compute canCancel correctly', () => {
      fixture.detectChanges();
      component.order.set({ ...mockOrder, status: 'PENDING' });
      expect(component.canCancel()).toBe(true);

      component.order.set({ ...mockOrder, status: 'DELIVERED' });
      expect(component.canCancel()).toBe(false);
    });
  });
});
