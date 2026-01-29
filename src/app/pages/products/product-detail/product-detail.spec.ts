import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from '../../../services';
import { AuthService } from '../../../auth';
import { of, throwError } from 'rxjs';
import { ProductDTO } from '../../../models/product.model';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProduct: ProductDTO = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stockQuantity: 50,
    category: 'Electronics',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z'
  };

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('ProductService', ['getById', 'delete']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockProductService.getById.and.returnValue(of(mockProduct));
    mockAuthService.hasRole.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load product on init', () => {
      fixture.detectChanges();
      expect(mockProductService.getById).toHaveBeenCalledWith(1);
      expect(component.product()).toEqual(mockProduct);
    });

    it('should handle invalid product ID', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ProductDetailComponent],
        providers: [
          { provide: ProductService, useValue: mockProductService },
          { provide: AuthService, useValue: mockAuthService },
          { provide: Router, useValue: mockRouter },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                paramMap: {
                  get: (key: string) => null
                }
              }
            }
          }
        ]
      });
      const newFixture = TestBed.createComponent(ProductDetailComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      expect(newComponent.error()).toBe('Invalid product ID');
    });

    it('should handle error when loading product fails', () => {
      mockProductService.getById.and.returnValue(throwError(() => new Error('Load failed')));
      fixture.detectChanges();
      expect(component.error()).toBe('Failed to load product details. Please try again.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Delete Product', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should delete product and navigate away', () => {
      mockProductService.delete.and.returnValue(of(undefined));
      component.deleteProduct();
      expect(mockProductService.delete).toHaveBeenCalledWith(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should not delete if user cancels', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.deleteProduct();
      expect(mockProductService.delete).not.toHaveBeenCalled();
    });

    it('should handle error when deleting fails', () => {
      mockProductService.delete.and.returnValue(throwError(() => new Error('Delete failed')));
      component.deleteProduct();
      expect(component.error()).toBe('Failed to delete product.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate back to products list', () => {
      fixture.detectChanges();
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });

  describe('Computed Values', () => {
    it('should compute hasProduct correctly', () => {
      expect(component.hasProduct()).toBe(false);
      fixture.detectChanges();
      setTimeout(() => {
        expect(component.hasProduct()).toBe(true);
      }, 100);
    });

    it('should compute isAdmin correctly', () => {
      mockAuthService.hasRole.and.returnValue(true);
      fixture.detectChanges();
      expect(component.isAdmin()).toBe(true);
    });

    it('should compute stockClass correctly', () => {
      fixture.detectChanges();
      component.product.set({ ...mockProduct, stockQuantity: 0 });
      expect(component.stockClass()).toBe('out-of-stock');

      component.product.set({ ...mockProduct, stockQuantity: 5 });
      expect(component.stockClass()).toBe('low-stock');

      component.product.set({ ...mockProduct, stockQuantity: 50 });
      expect(component.stockClass()).toBe('in-stock');
    });

    it('should compute stockLabel correctly', () => {
      fixture.detectChanges();
      component.product.set({ ...mockProduct, stockQuantity: 0 });
      expect(component.stockLabel()).toBe('Out of Stock');

      component.product.set({ ...mockProduct, stockQuantity: 5 });
      expect(component.stockLabel()).toBe('Low Stock');

      component.product.set({ ...mockProduct, stockQuantity: 50 });
      expect(component.stockLabel()).toBe('In Stock');
    });
  });

  describe('Helper Methods', () => {
    it('should format currency correctly', () => {
      expect(component.formatCurrency(99.99)).toBe('$99.99');
      expect(component.formatCurrency(0)).toBe('$0.00');
      expect(component.formatCurrency(undefined)).toBe('$0.00');
    });

    it('should format date correctly', () => {
      const formatted = component.formatDate('2024-01-15T10:00:00Z');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
    });
  });
});
