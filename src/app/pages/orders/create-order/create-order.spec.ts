import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateOrderComponent } from './create-order.component';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { of, throwError } from 'rxjs';
import { OrderDTO } from '../../../models/order.model';
import { ProductDTO } from '../../../models/product.model';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

describe('CreateOrderComponent', () => {
  let component: CreateOrderComponent;
  let fixture: ComponentFixture<CreateOrderComponent>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProducts: ProductDTO[] = [
    { id: 1, name: 'Product 1', price: 50.00, stockQuantity: 10 },
    { id: 2, name: 'Product 2', price: 75.00, stockQuantity: 5 },
    { id: 3, name: 'Product 3', price: 100.00, stockQuantity: 0 }
  ];

  const mockProductsResponse: PaginatedResponse<ProductDTO> = {
    content: mockProducts,
    totalElements: 3,
    totalPages: 1,
    size: 100,
    number: 0,
    first: true,
    last: true,
    empty: false
  };

  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', ['create']);
    mockProductService = jasmine.createSpyObj('ProductService', ['getAll']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockProductService.getAll.and.returnValue(of(mockProductsResponse));

    await TestBed.configureTestingModule({
      imports: [CreateOrderComponent, ReactiveFormsModule],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        { provide: ProductService, useValue: mockProductService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form on init', () => {
      fixture.detectChanges();
      expect(component.orderForm).toBeDefined();
      expect(component.orderForm.get('userId')).toBeDefined();
      expect(component.orderForm.get('productIds')).toBeDefined();
    });

    it('should load products on init', () => {
      fixture.detectChanges();
      expect(mockProductService.getAll).toHaveBeenCalledWith(0, 100);
      expect(component.availableProducts().length).toBe(2); // Only products with stock > 0
    });

    it('should handle error when loading products fails', () => {
      mockProductService.getAll.and.returnValue(throwError(() => new Error('Load failed')));
      fixture.detectChanges();
      expect(component.error()).toBe('Failed to load products.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have invalid form initially', () => {
      expect(component.orderForm.valid).toBe(false);
    });

    it('should require userId', () => {
      const userId = component.orderForm.get('userId');
      expect(userId?.hasError('required')).toBe(true);

      userId?.setValue(100);
      expect(userId?.hasError('required')).toBe(false);
    });

    it('should require at least one product', () => {
      component.orderForm.get('userId')?.setValue(100);
      expect(component.orderForm.valid).toBe(false);

      component.addProduct();
      component.productIds.at(0).setValue(1);
      expect(component.orderForm.valid).toBe(true);
    });

    it('should validate userId is positive number', () => {
      const userId = component.orderForm.get('userId');
      userId?.setValue(-1);
      expect(userId?.hasError('min')).toBe(true);

      userId?.setValue(1);
      expect(userId?.hasError('min')).toBe(false);
    });
  });

  describe('Product Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should add product to form array', () => {
      expect(component.productIds.length).toBe(0);
      component.addProduct();
      expect(component.productIds.length).toBe(1);
    });

    it('should remove product from form array', () => {
      component.addProduct();
      component.addProduct();
      expect(component.productIds.length).toBe(2);

      component.removeProduct(0);
      expect(component.productIds.length).toBe(1);
    });

    it('should add multiple products', () => {
      component.addProduct();
      component.addProduct();
      component.addProduct();
      expect(component.productIds.length).toBe(3);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.orderForm.get('userId')?.setValue(100);
      component.addProduct();
      component.productIds.at(0).setValue(1);
    });

    it('should create order on valid form submission', (done) => {
      const createdOrder: OrderDTO = {
        id: 1,
        userId: 100,
        productIds: [1],
        totalAmount: 50.00,
        status: 'PENDING'
      };

      mockOrderService.create.and.returnValue(of(createdOrder));
      component.onSubmit();

      expect(mockOrderService.create).toHaveBeenCalledWith({
        userId: 100,
        productIds: [1]
      });

      setTimeout(() => {
        expect(component.success()).toBe(true);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders', 1]);
        done();
      }, 1600);
    });

    it('should not submit invalid form', () => {
      component.orderForm.get('userId')?.setValue('');
      component.onSubmit();
      expect(mockOrderService.create).not.toHaveBeenCalled();
      expect(component.error()).toBe('Please fill in all required fields.');
    });

    it('should handle error when creating order fails', () => {
      mockOrderService.create.and.returnValue(throwError(() => new Error('Create failed')));
      component.onSubmit();
      expect(component.error()).toBe('Failed to create order. Please try again.');
      expect(component.isSubmitting()).toBe(false);
    });

    it('should set submitting state during submission', () => {
      mockOrderService.create.and.returnValue(of({
        id: 1,
        userId: 100,
        productIds: [1]
      }));

      expect(component.isSubmitting()).toBe(false);
      component.onSubmit();
      expect(component.isSubmitting()).toBe(false); // Will be false after sync completion
    });
  });

  describe('Navigation', () => {
    it('should navigate to orders list on cancel', () => {
      fixture.detectChanges();
      component.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/orders']);
    });
  });

  describe('Helper Methods', () => {
    it('should format currency correctly', () => {
      expect(component.formatCurrency(150.50)).toBe('$150.50');
      expect(component.formatCurrency(0)).toBe('$0.00');
      expect(component.formatCurrency(undefined)).toBe('$0.00');
    });
  });

  describe('Template Rendering', () => {
    it('should render form fields', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('#userId')).toBeTruthy();
    });

    it('should display success message on successful submission', () => {
      fixture.detectChanges();
      component.success.set(true);
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.alert-success')).toBeTruthy();
    });

    it('should display error message on failure', () => {
      fixture.detectChanges();
      component.error.set('Test error');
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.alert-error')).toBeTruthy();
    });
  });
});
