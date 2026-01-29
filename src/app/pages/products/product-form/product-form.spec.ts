import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../services';
import { of, throwError } from 'rxjs';
import { ProductDTO } from '../../../models/product.model';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProduct: ProductDTO = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    stockQuantity: 50,
    category: 'Electronics'
  };

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('ProductService', ['getById', 'create', 'update']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: mockProductService },
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
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize form in create mode', () => {
      fixture.detectChanges();
      expect(component.isEditMode()).toBe(false);
      expect(component.productForm).toBeDefined();
    });

    it('should initialize form in edit mode', async () => {
      TestBed.resetTestingModule();
      mockProductService.getById.and.returnValue(of(mockProduct));

      await TestBed.configureTestingModule({
        imports: [ProductFormComponent, ReactiveFormsModule],
        providers: [
          { provide: ProductService, useValue: mockProductService },
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

      const newFixture = TestBed.createComponent(ProductFormComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.isEditMode()).toBe(true);
      expect(newComponent.productId()).toBe(1);
      expect(mockProductService.getById).toHaveBeenCalledWith(1);
    });

    it('should handle error when loading product fails', () => {
      mockProductService.getById.and.returnValue(throwError(() => new Error('Load failed')));
      TestBed.resetTestingModule();

      TestBed.configureTestingModule({
        imports: [ProductFormComponent, ReactiveFormsModule],
        providers: [
          { provide: ProductService, useValue: mockProductService },
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
      });

      const newFixture = TestBed.createComponent(ProductFormComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.error()).toBe('Failed to load product details. Please try again.');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have invalid form initially', () => {
      expect(component.productForm.valid).toBe(false);
    });

    it('should require name', () => {
      const name = component.productForm.get('name');
      expect(name?.hasError('required')).toBe(true);

      name?.setValue('Test');
      expect(name?.hasError('required')).toBe(false);
    });

    it('should validate name minlength', () => {
      const name = component.productForm.get('name');
      name?.setValue('AB');
      expect(name?.hasError('minlength')).toBe(true);

      name?.setValue('ABC');
      expect(name?.hasError('minlength')).toBe(false);
    });

    it('should require price', () => {
      const price = component.productForm.get('price');
      expect(price?.hasError('required')).toBe(true);

      price?.setValue(10);
      expect(price?.hasError('required')).toBe(false);
    });

    it('should validate price minimum', () => {
      const price = component.productForm.get('price');
      price?.setValue(0);
      expect(price?.hasError('min')).toBe(true);

      price?.setValue(0.01);
      expect(price?.hasError('min')).toBe(false);
    });

    it('should require category', () => {
      const category = component.productForm.get('category');
      expect(category?.hasError('required')).toBe(true);

      category?.setValue('Electronics');
      expect(category?.hasError('required')).toBe(false);
    });

    it('should require stock quantity', () => {
      const stock = component.productForm.get('stockQuantity');
      expect(stock?.hasError('required')).toBe(true);

      stock?.setValue(10);
      expect(stock?.hasError('required')).toBe(false);
    });
  });

  describe('Form Submission - Create', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.productForm.patchValue({
        name: 'New Product',
        description: 'New Description',
        price: 49.99,
        stockQuantity: 100,
        category: 'Books'
      });
    });

    it('should create product on valid form submission', (done) => {
      const createdProduct: ProductDTO = {
        id: 2,
        name: 'New Product',
        description: 'New Description',
        price: 49.99,
        stockQuantity: 100,
        category: 'Books'
      };

      mockProductService.create.and.returnValue(of(createdProduct));
      component.onSubmit();

      expect(mockProductService.create).toHaveBeenCalled();

      setTimeout(() => {
        expect(component.success()).toBe(true);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 2]);
        done();
      }, 1600);
    });

    it('should not submit invalid form', () => {
      component.productForm.get('name')?.setValue('');
      component.onSubmit();
      expect(mockProductService.create).not.toHaveBeenCalled();
      expect(component.error()).toBe('Please fix all validation errors before submitting.');
    });

    it('should handle error when creating product fails', () => {
      mockProductService.create.and.returnValue(throwError(() => new Error('Create failed')));
      component.onSubmit();
      expect(component.error()).toBe('Failed to create product. Please try again.');
      expect(component.isSubmitting()).toBe(false);
    });
  });

  describe('Form Submission - Update', () => {
    beforeEach(async () => {
      TestBed.resetTestingModule();
      mockProductService.getById.and.returnValue(of(mockProduct));

      await TestBed.configureTestingModule({
        imports: [ProductFormComponent, ReactiveFormsModule],
        providers: [
          { provide: ProductService, useValue: mockProductService },
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

      fixture = TestBed.createComponent(ProductFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should update product on valid form submission', (done) => {
      mockProductService.update.and.returnValue(of(mockProduct));
      component.onSubmit();

      expect(mockProductService.update).toHaveBeenCalledWith(1, jasmine.any(Object));

      setTimeout(() => {
        expect(component.success()).toBe(true);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/products', 1]);
        done();
      }, 1600);
    });

    it('should handle error when updating product fails', () => {
      mockProductService.update.and.returnValue(throwError(() => new Error('Update failed')));
      component.onSubmit();
      expect(component.error()).toBe('Failed to update product. Please try again.');
      expect(component.isSubmitting()).toBe(false);
    });
  });

  describe('Cancel', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate without confirmation if form is pristine', () => {
      component.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should confirm before navigating if form is dirty', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.productForm.markAsDirty();
      component.cancel();
      expect(window.confirm).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should not navigate if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.productForm.markAsDirty();
      component.cancel();
      expect(window.confirm).toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return field error message', () => {
      const name = component.productForm.get('name');
      name?.setValue('');
      name?.markAsTouched();
      expect(component.getFieldError('name')).toBe('This field is required');

      name?.setValue('AB');
      expect(component.getFieldError('name')).toContain('Minimum length');
    });

    it('should check if field is invalid', () => {
      const name = component.productForm.get('name');
      expect(component.isFieldInvalid('name')).toBe(false);

      name?.setValue('');
      name?.markAsTouched();
      expect(component.isFieldInvalid('name')).toBe(true);
    });
  });

  describe('Computed Values', () => {
    it('should compute formTitle correctly', () => {
      fixture.detectChanges();
      expect(component.formTitle()).toBe('Create New Product');

      component.isEditMode.set(true);
      expect(component.formTitle()).toBe('Edit Product');
    });

    it('should compute submitButtonText correctly', () => {
      fixture.detectChanges();
      expect(component.submitButtonText()).toBe('Create Product');

      component.isEditMode.set(true);
      expect(component.submitButtonText()).toBe('Update Product');
    });
  });
});
