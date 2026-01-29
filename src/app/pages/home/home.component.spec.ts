import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthService } from '../../auth';
import { BehaviorSubject } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole'], {
      isAuthenticated$: isAuthenticatedSubject.asObservable()
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with authentication state', () => {
    expect(component.isAuthenticated()).toBe(false);
  });

  it('should show 4 features total', () => {
    expect(component.features().length).toBe(4);
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      isAuthenticatedSubject.next(false);
      fixture.detectChanges();
    });

    it('should show only non-auth features', () => {
      const visibleFeatures = component.visibleFeatures();
      expect(visibleFeatures.length).toBe(1);
      expect(visibleFeatures[0].requiresAuth).toBe(false);
    });

    it('should navigate to login when getStarted is called', () => {
      component.getStarted();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should navigate to login when login is called', () => {
      component.login();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(async () => {
      // Create new test bed with authenticated state
      isAuthenticatedSubject = new BehaviorSubject<boolean>(true);
      mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole'], {
        isAuthenticated$: isAuthenticatedSubject.asObservable()
      });

      await TestBed.configureTestingModule({
        imports: [HomeComponent],
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: Router, useValue: mockRouter }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show all features', () => {
      const visibleFeatures = component.visibleFeatures();
      expect(visibleFeatures.length).toBe(4);
    });

    it('should navigate to dashboard when getStarted is called', () => {
      component.getStarted();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('feature navigation', () => {
    it('should navigate to specified route', () => {
      const testRoute = '/products';
      component.navigateTo(testRoute);
      expect(mockRouter.navigate).toHaveBeenCalledWith([testRoute]);
    });
  });

  describe('template rendering', () => {
    it('should render hero section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.hero')).toBeTruthy();
      expect(compiled.querySelector('.hero-title')?.textContent)
        .toContain('Welcome to Order & Product Management');
    });

    it('should render features section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.features')).toBeTruthy();
      expect(compiled.querySelector('.features-grid')).toBeTruthy();
    });

    it('should render benefits section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.benefits')).toBeTruthy();
      const benefitCards = compiled.querySelectorAll('.benefit-card');
      expect(benefitCards.length).toBe(4);
    });

    it('should render CTA section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.cta')).toBeTruthy();
    });
  });
});

