import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideZoneChangeDetection } from '@angular/core';
import { HomeComponent } from './home.component';
import { AuthService } from '../../auth';
import { BehaviorSubject } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

    mockAuthService = jasmine.createSpyObj('AuthService', ['hasRole'], {
      isAuthenticated$: isAuthenticatedSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
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
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should navigate to login when login is called', () => {
      component.login();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      // Update authentication state
      isAuthenticatedSubject.next(true);
      fixture.detectChanges();
    });

    it('should show all features', () => {
      const visibleFeatures = component.visibleFeatures();
      expect(visibleFeatures.length).toBe(4);
    });

    it('should navigate to dashboard when getStarted is called', () => {
      component.getStarted();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('feature navigation', () => {
    it('should navigate to specified route', () => {
      const testRoute = '/products';
      component.navigateTo(testRoute);
      expect(router.navigate).toHaveBeenCalledWith([testRoute]);
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

