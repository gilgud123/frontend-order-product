import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../services';
import { AuthService } from '../../../auth';
import { of, throwError } from 'rxjs';
import { PaginatedResponse } from '../../../shared/models/pagination.model';
import { ProductDTO } from '../../../models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockProductsResponse: PaginatedResponse<ProductDTO> = {
    content: [
      { id: 1, name: 'Product 1', price: 50.00, stockQuantity: 100, category: 'Electronics', createdAt: '2024-01-15T10:00:00Z' },
      { id: 2, name: 'Product 2', price: 75.50, stockQuantity: 5, category: 'Books', createdAt: '2024-01-16T14:30:00Z' }
    ],
    totalElements: 50,
    totalPages: 5,
    size: 12,
    number: 0,
    first: true,
    last: false,
    empty: false
  };

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('ProductService', [
      'getAll',
      'search',
      'filter',
      'delete'
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole']);

    mockProductService.getAll.and.returnValue(of(mockProductsResponse));
    mockAuthService.hasRole.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load products on init', () => {
      fixture.detectChanges();
      expect(mockProductService.getAll).toHaveBeenCalledWith(0, 12);
      expect(component.products().length).toBe(2);
    });

    it('should initialize with default values', () => {
      expect(component.currentPage()).toBe(0);
      expect(component.pageSize()).toBe(12);
      expect(component.searchQuery()).toBe('');
      expect(component.selectedCategory()).toBe('ALL');
    });
  });

  describe('Loading Products', () => {
    it('should set loading state while fetching products', () => {
      fixture.detectChanges();
      expect(component.isLoading()).toBe(false);
    });

    it('should update pagination info from response', () => {
      fixture.detectChanges();
      expect(component.totalElements()).toBe(50);
      expect(component.totalPages()).toBe(5);
    });

    it('should handle error when loading products fails', () => {
      mockProductService.getAll.and.returnValue(throwError(() => new Error('Load failed')));
      fixture.detectChanges();
      expect(component.error()).toBe('Failed to load products. Please try again.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Search', () => {
    beforeEach(() => {
      fixture.detectChanges();
      mockProductService.search.and.returnValue(of(mockProductsResponse));
    });

    it('should search products', () => {
      component.searchQuery.set('test');
      component.onSearch();
      expect(mockProductService.search).toHaveBeenCalledWith('test', 0, 12);
    });

    it('should reset page on search', () => {
      component.currentPage.set(2);
      component.searchQuery.set('test');
      component.onSearch();
      expect(component.currentPage()).toBe(0);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      fixture.detectChanges();
      mockProductService.filter.and.returnValue(of(mockProductsResponse));
    });

    it('should filter by category', () => {
      component.selectedCategory.set('Electronics');
      component.onFilterChange();
      expect(mockProductService.filter).toHaveBeenCalled();
    });

    it('should filter by price range', () => {
      component.minPrice.set('10');
      component.maxPrice.set('100');
      component.onFilterChange();
      expect(mockProductService.filter).toHaveBeenCalled();
    });

    it('should reset page on filter change', () => {
      component.currentPage.set(2);
      component.selectedCategory.set('Books');
      component.onFilterChange();
      expect(component.currentPage()).toBe(0);
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should sort by name', () => {
      component.sortBy.set('name');
      component.onSortChange();
      expect(mockProductService.getAll).toHaveBeenCalled();
    });

    it('should toggle sort order', () => {
      expect(component.sortOrder()).toBe('asc');
      component.toggleSortOrder();
      expect(component.sortOrder()).toBe('desc');
      component.toggleSortOrder();
      expect(component.sortOrder()).toBe('asc');
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should go to next page', () => {
      component.nextPage();
      expect(component.currentPage()).toBe(1);
    });

    it('should go to previous page', () => {
      component.currentPage.set(2);
      component.previousPage();
      expect(component.currentPage()).toBe(1);
    });

    it('should not go beyond last page', () => {
      component.currentPage.set(4);
      component.nextPage();
      expect(component.currentPage()).toBe(4);
    });

    it('should go to specific page', () => {
      component.goToPage(3);
      expect(component.currentPage()).toBe(3);
    });
  });

  describe('Delete Product', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);
    });

    it('should delete product', () => {
      mockProductService.delete.and.returnValue(of(undefined));
      component.deleteProduct(1);
      expect(mockProductService.delete).toHaveBeenCalledWith(1);
    });

    it('should not delete if user cancels', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.deleteProduct(1);
      expect(mockProductService.delete).not.toHaveBeenCalled();
    });

    it('should handle error when deleting fails', () => {
      mockProductService.delete.and.returnValue(throwError(() => new Error('Delete failed')));
      component.deleteProduct(1);
      expect(component.error()).toBe('Failed to delete product.');
    });
  });

  describe('Clear Filters', () => {
    it('should clear all filters', () => {
      component.searchQuery.set('test');
      component.selectedCategory.set('Electronics');
      component.minPrice.set('10');
      component.maxPrice.set('100');
      component.stockFilter.set('LOW_STOCK');
      component.currentPage.set(2);

      component.clearFilters();

      expect(component.searchQuery()).toBe('');
      expect(component.selectedCategory()).toBe('ALL');
      expect(component.minPrice()).toBe('');
      expect(component.maxPrice()).toBe('');
      expect(component.stockFilter()).toBe('ALL');
      expect(component.currentPage()).toBe(0);
    });
  });

  describe('Helper Methods', () => {
    it('should return correct stock class', () => {
      expect(component.getStockClass(0)).toBe('out-of-stock');
      expect(component.getStockClass(5)).toBe('low-stock');
      expect(component.getStockClass(50)).toBe('in-stock');
    });

    it('should return correct stock label', () => {
      expect(component.getStockLabel(0)).toBe('Out of Stock');
      expect(component.getStockLabel(5)).toBe('Low Stock');
      expect(component.getStockLabel(50)).toBe('In Stock');
    });

    it('should format currency correctly', () => {
      expect(component.formatCurrency(150.50)).toBe('$150.50');
      expect(component.formatCurrency(0)).toBe('$0.00');
      expect(component.formatCurrency(undefined)).toBe('$0.00');
    });

    it('should format date correctly', () => {
      const formatted = component.formatDate('2024-01-15T10:00:00Z');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
    });
  });

  describe('Computed Values', () => {
    it('should compute hasProducts correctly', () => {
      expect(component.hasProducts()).toBe(false);
      fixture.detectChanges();
      expect(component.hasProducts()).toBe(true);
    });

    it('should compute isAdmin correctly', () => {
      mockAuthService.hasRole.and.returnValue(true);
      fixture.detectChanges();
      expect(component.isAdmin()).toBe(true);
    });

    it('should compute hasPreviousPage correctly', () => {
      expect(component.hasPreviousPage()).toBe(false);
      component.currentPage.set(1);
      expect(component.hasPreviousPage()).toBe(true);
    });

    it('should compute hasNextPage correctly', () => {
      fixture.detectChanges();
      expect(component.hasNextPage()).toBe(true);
      component.currentPage.set(4);
      expect(component.hasNextPage()).toBe(false);
    });
  });
});
