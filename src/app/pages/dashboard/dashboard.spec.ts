import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideZoneChangeDetection } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { ProductService } from '../../services';
import { OrderService, OrderStatistics } from '../../services';
import { UserService } from '../../services';
import { AuthService } from '../../auth';
import { of, throwError } from 'rxjs';
import { PaginatedResponse } from '../../shared';
import { ProductDTO } from '../../models/product.model';
import { OrderDTO } from '../../models/order.model';
import { UserDTO } from '../../models/user.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockProductsResponse: PaginatedResponse<ProductDTO> = {
    content: [],
    totalElements: 100,
    totalPages: 10,
    size: 10,
    number: 0,
    first: true,
    last: false,
    empty: true
  };

  const mockOrdersResponse: PaginatedResponse<OrderDTO> = {
    content: [],
    totalElements: 50,
    totalPages: 5,
    size: 10,
    number: 0,
    first: true,
    last: false,
    empty: true
  };

  const mockUsersResponse: PaginatedResponse<UserDTO> = {
    content: [],
    totalElements: 25,
    totalPages: 3,
    size: 10,
    number: 0,
    first: true,
    last: false,
    empty: true
  };

  const mockStatistics: OrderStatistics = {
    totalOrders: 50,
    pendingOrders: 5,
    processingOrders: 10,
    shippedOrders: 15,
    deliveredOrders: 18,
    cancelledOrders: 2,
    totalRevenue: 50000,
    averageOrderValue: 1000
  };

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('ProductService', ['getAll', 'getLowStock']);
    mockOrderService = jasmine.createSpyObj('OrderService', ['getAll', 'getMyOrders', 'getStatistics']);
    mockUserService = jasmine.createSpyObj('UserService', ['getAll']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole'], {
      user$: of({ name: 'Test User', preferred_username: 'testuser' })
    });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter([]),
        { provide: ProductService, useValue: mockProductService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Admin User', () => {
    beforeEach(() => {
      mockAuthService.hasRole.and.returnValue(true);
      mockProductService.getAll.and.returnValue(of(mockProductsResponse));
      mockProductService.getLowStock.and.returnValue(of([]));
      mockOrderService.getAll.and.returnValue(of(mockOrdersResponse));
      mockUserService.getAll.and.returnValue(of(mockUsersResponse));
      mockOrderService.getStatistics.and.returnValue(of(mockStatistics));
    });

    it('should set isAdmin to true', () => {
      fixture.detectChanges();
      expect(component.isAdmin()).toBe(true);
    });

    it('should load all admin statistics', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockProductService.getAll).toHaveBeenCalled();
        expect(mockProductService.getLowStock).toHaveBeenCalled();
        expect(mockOrderService.getAll).toHaveBeenCalled();
        expect(mockUserService.getAll).toHaveBeenCalled();
        expect(mockOrderService.getStatistics).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should update stats with loaded data', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        const stats = component.stats();
        expect(stats.totalProducts).toBe(100);
        expect(stats.totalOrders).toBe(50);
        expect(stats.totalUsers).toBe(25);
        expect(stats.totalRevenue).toBe(50000);
        expect(stats.pendingOrders).toBe(5);
        done();
      }, 100);
    });

    it('should show admin stat cards', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        const statCards = component.statCards();
        expect(statCards.length).toBeGreaterThanOrEqual(3);
        expect(statCards.some(card => card.title === 'Total Products')).toBe(true);
        expect(statCards.some(card => card.title === 'Total Users')).toBe(true);
        done();
      }, 100);
    });

    it('should show all quick actions including admin ones', () => {
      fixture.detectChanges();
      const actions = component.visibleActions();
      expect(actions.length).toBe(6);
      expect(actions.some(a => a.title === 'Manage Users')).toBe(true);
    });
  });

  describe('Regular User', () => {
    beforeEach(() => {
      mockAuthService.hasRole.and.returnValue(false);
      mockOrderService.getMyOrders.and.returnValue(of(mockOrdersResponse));
    });

    it('should set isAdmin to false', () => {
      fixture.detectChanges();
      expect(component.isAdmin()).toBe(false);
    });

    it('should load only user orders', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(mockOrderService.getMyOrders).toHaveBeenCalled();
        expect(mockProductService.getAll).not.toHaveBeenCalled();
        expect(mockUserService.getAll).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should update stats with user order data', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        const stats = component.stats();
        expect(stats.totalOrders).toBe(50);
        done();
      }, 100);
    });

    it('should filter out admin-only quick actions', () => {
      fixture.detectChanges();
      const actions = component.visibleActions();
      expect(actions.length).toBe(4);
      expect(actions.some(a => a.title === 'Manage Users')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockAuthService.hasRole.and.returnValue(false);
    });

    it('should handle error when loading user orders', (done) => {
      mockOrderService.getMyOrders.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      fixture.detectChanges();

      setTimeout(() => {
        expect(component.error()).toBe('Failed to load dashboard data');
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });
  });

  describe('User Profile', () => {
    it('should set userName from user profile', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.userName()).toBe('Test User');
        done();
      }, 50);
    });

    it('should use preferred_username if name is not available', (done) => {
      mockAuthService.user$ = of({ sub: 'test-sub', preferred_username: 'testuser' });
      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.userName()).toBe('testuser');
        done();
      }, 50);
    });

    it('should default to "User" if no name available', (done) => {
      mockAuthService.user$ = of({ sub: 'test-sub' });
      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.userName()).toBe('User');
        done();
      }, 50);
    });
  });

  describe('Refresh Functionality', () => {
    beforeEach(() => {
      mockAuthService.hasRole.and.returnValue(false);
      mockOrderService.getMyOrders.and.returnValue(of(mockOrdersResponse));
    });

    it('should reload dashboard data on refresh', () => {
      fixture.detectChanges();
      mockOrderService.getMyOrders.calls.reset();

      component.refresh();

      expect(mockOrderService.getMyOrders).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      mockAuthService.hasRole.and.returnValue(false);
      mockOrderService.getMyOrders.and.returnValue(of(mockOrdersResponse));
    });

    it('should render dashboard header', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.dashboard-header')).toBeTruthy();
        expect(compiled.querySelector('.welcome-title')).toBeTruthy();
        done();
      }, 100);
    });

    it('should render loading state initially', () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-container')).toBeTruthy();
    });

    it('should render stats section after loading', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.stats-section')).toBeTruthy();
        expect(compiled.querySelector('.actions-section')).toBeTruthy();
        done();
      }, 100);
    });
  });
});
