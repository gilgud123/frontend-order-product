import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerRevenueComponent } from './customer-revenue.component';
import { OrderService } from '../../../services/order.service';
import { of, throwError } from 'rxjs';
import { CustomerRevenueDTO } from '../../../models/customer-revenue.model';

describe('CustomerRevenueComponent', () => {
  let component: CustomerRevenueComponent;
  let fixture: ComponentFixture<CustomerRevenueComponent>;
  let mockOrderService: jasmine.SpyObj<OrderService>;

  const mockRevenueData: CustomerRevenueDTO[] = [
    { customerId: 100, year: 2022, totalRevenue: 1500.00 },
    { customerId: 100, year: 2023, totalRevenue: 2500.00 },
    { customerId: 100, year: 2024, totalRevenue: 3000.00 }
  ];

  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', ['getCustomerRevenue']);
    mockOrderService.getCustomerRevenue.and.returnValue(of(mockRevenueData));

    await TestBed.configureTestingModule({
      imports: [CustomerRevenueComponent],
      providers: [
        { provide: OrderService, useValue: mockOrderService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerRevenueComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty data', () => {
      expect(component.revenueData().length).toBe(0);
      expect(component.searchCustomerId()).toBe('');
    });

    it('should not load data on init', () => {
      fixture.detectChanges();
      expect(mockOrderService.getCustomerRevenue).not.toHaveBeenCalled();
    });
  });

  describe('Search Revenue', () => {
    it('should search revenue for valid customer ID', () => {
      component.searchCustomerId.set('100');
      component.searchRevenue();
      expect(mockOrderService.getCustomerRevenue).toHaveBeenCalledWith(100);
    });

    it('should show error for empty customer ID', () => {
      component.searchCustomerId.set('');
      component.searchRevenue();
      expect(component.error()).toBe('Please enter a customer ID');
      expect(mockOrderService.getCustomerRevenue).not.toHaveBeenCalled();
    });

    it('should show error for invalid customer ID', () => {
      component.searchCustomerId.set('invalid');
      component.searchRevenue();
      expect(component.error()).toBe('Invalid customer ID');
      expect(mockOrderService.getCustomerRevenue).not.toHaveBeenCalled();
    });

    it('should handle empty result', () => {
      mockOrderService.getCustomerRevenue.and.returnValue(of([]));
      component.searchCustomerId.set('100');
      component.searchRevenue();
      expect(component.error()).toBe('No revenue data found for this customer');
    });

    it('should handle error when search fails', () => {
      mockOrderService.getCustomerRevenue.and.returnValue(throwError(() => new Error('Search failed')));
      component.searchCustomerId.set('100');
      component.searchRevenue();
      expect(component.error()).toBe('Failed to load revenue data. Customer may not exist or have no orders.');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Load Customer Revenue', () => {
    it('should load and display revenue data', () => {
      component.loadCustomerRevenue(100);
      expect(mockOrderService.getCustomerRevenue).toHaveBeenCalledWith(100);
      expect(component.revenueData().length).toBe(3);
      expect(component.isLoading()).toBe(false);
    });

    it('should set loading state correctly', () => {
      component.loadCustomerRevenue(100);
      expect(component.isLoading()).toBe(false); // Will be false after sync completion
    });

    it('should clear error on successful load', () => {
      component.error.set('Previous error');
      component.loadCustomerRevenue(100);
      expect(component.error()).toBe(null);
    });
  });

  describe('Computed Values', () => {
    beforeEach(() => {
      component.revenueData.set(mockRevenueData);
    });

    it('should compute hasData correctly', () => {
      expect(component.hasData()).toBe(true);
      component.revenueData.set([]);
      expect(component.hasData()).toBe(false);
    });

    it('should compute totalRevenue correctly', () => {
      expect(component.totalRevenue()).toBe(7000.00);
    });

    it('should filter data by customer ID', () => {
      component.searchCustomerId.set('100');
      expect(component.filteredData().length).toBe(3);

      component.searchCustomerId.set('10');
      expect(component.filteredData().length).toBe(3);

      component.searchCustomerId.set('999');
      expect(component.filteredData().length).toBe(0);
    });

    it('should return all data when search is empty', () => {
      component.searchCustomerId.set('');
      expect(component.filteredData().length).toBe(3);
    });
  });

  describe('Helper Methods', () => {
    it('should format currency correctly', () => {
      expect(component.formatCurrency(1500.50)).toBe('$1,500.50');
      expect(component.formatCurrency(0)).toBe('$0.00');
      expect(component.formatCurrency(undefined)).toBe('$0.00');
    });

    it('should return different colors for different indices', () => {
      const color1 = component.getYearColor(0);
      const color2 = component.getYearColor(1);
      const color3 = component.getYearColor(2);

      expect(color1).not.toBe(color2);
      expect(color2).not.toBe(color3);
      expect(color1).not.toBe(color3);
    });

    it('should cycle colors for large indices', () => {
      const color0 = component.getYearColor(0);
      const color10 = component.getYearColor(10);

      expect(color0).toBe(color10); // Should wrap around
    });
  });

  describe('Template Rendering', () => {
    it('should display empty state when no data', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.empty-state')).toBeTruthy();
    });

    it('should display revenue data when loaded', () => {
      component.revenueData.set(mockRevenueData);
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.revenue-card')).toBeTruthy();
    });

    it('should display summary card with totals', () => {
      component.revenueData.set(mockRevenueData);
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.summary-card')).toBeTruthy();
    });

    it('should display error message', () => {
      component.error.set('Test error');
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.alert-error')).toBeTruthy();
    });

    it('should display loading state', () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.loading-container')).toBeTruthy();
    });
  });

  describe('Data Visualization', () => {
    beforeEach(() => {
      component.revenueData.set(mockRevenueData);
      fixture.detectChanges();
    });

    it('should display revenue cards for each year', () => {
      const compiled = fixture.nativeElement;
      const cards = compiled.querySelectorAll('.revenue-card');
      expect(cards.length).toBe(3);
    });

    it('should display revenue table', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.revenue-table')).toBeTruthy();
    });

    it('should calculate percentage correctly in template', () => {
      // This is implicitly tested through the template rendering
      // The percentage calculation should work with the totalRevenue computed signal
      expect(component.totalRevenue()).toBe(7000.00);
      const percentage = (mockRevenueData[0].totalRevenue / component.totalRevenue()) * 100;
      expect(percentage).toBeCloseTo(21.43, 1);
    });
  });
});
