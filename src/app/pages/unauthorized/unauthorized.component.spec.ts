import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { UnauthorizedComponent } from './unauthorized.component';
import { AuthService } from '../../auth';
import { of } from 'rxjs';

describe('UnauthorizedComponent', () => {
  let component: UnauthorizedComponent;
  let fixture: ComponentFixture<UnauthorizedComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      user$: of({ realm_access: { roles: ['USER'] } })
    });

    mockRouter.getCurrentNavigation.and.returnValue(null);
    mockAuthService.isAuthenticated.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [UnauthorizedComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty attempted URL', () => {
      fixture.detectChanges();
      expect(component.attemptedUrl()).toBe('');
    });

    it('should set attempted URL from navigation state', () => {
      const mockNavigation = {
        extras: {
          state: {
            url: '/admin/dashboard'
          }
        }
      } as any;

      mockRouter.getCurrentNavigation.and.returnValue(mockNavigation);

      fixture = TestBed.createComponent(UnauthorizedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.attemptedUrl()).toBe('/admin/dashboard');
    });

    it('should load user roles on init', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.userRoles().length).toBeGreaterThan(0);
        expect(component.userRoles()).toContain('USER');
        done();
      }, 100);
    });

    it('should handle user with no roles', (done) => {
      mockAuthService.user$ = of({ sub: 'test-user', realm_access: undefined } as any);
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.userRoles().length).toBe(0);
        done();
      }, 100);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate back when goBack is called', () => {
      component.goBack();
      expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should navigate to home when goHome is called', () => {
      component.goHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Contact Support', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(window, 'alert');
    });

    it('should show alert when contactSupport is called', () => {
      component.contactSupport();
      expect(window.alert).toHaveBeenCalledWith('Please contact your administrator for access permissions.');
    });
  });

  describe('Computed Values', () => {
    it('should compute isAuthenticated correctly', () => {
      fixture.detectChanges();
      expect(component.isAuthenticated()).toBe(true);
    });

    it('should compute hasRoles correctly', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.hasRoles()).toBe(true);
        done();
      }, 100);
    });

    it('should return false for hasRoles when no roles', (done) => {
      mockAuthService.user$ = of({ sub: 'test-user' } as any);
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.hasRoles()).toBe(false);
        done();
      }, 100);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display 403 error code', () => {
      const compiled = fixture.nativeElement;
      const errorCode = compiled.querySelector('.error-code');
      expect(errorCode?.textContent).toContain('403');
    });

    it('should display error title', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('.error-title');
      expect(title?.textContent).toContain('Access Denied');
    });

    it('should display attempted URL when available', () => {
      component.attemptedUrl.set('/admin/users');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const attemptedUrl = compiled.querySelector('.attempted-url');
      expect(attemptedUrl?.textContent).toContain('/admin/users');
    });

    it('should not display attempted URL when not available', () => {
      const compiled = fixture.nativeElement;
      const attemptedUrl = compiled.querySelector('.attempted-url');
      expect(attemptedUrl).toBeFalsy();
    });

    it('should display user info when authenticated', () => {
      const compiled = fixture.nativeElement;
      const userInfo = compiled.querySelector('.user-info');
      expect(userInfo).toBeTruthy();
    });

    it('should display reasons card', () => {
      const compiled = fixture.nativeElement;
      const reasonsCard = compiled.querySelector('.reasons-card');
      expect(reasonsCard).toBeTruthy();
    });

    it('should have Go Back button', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btn');
      const backButton = Array.from(buttons).find((btn: any) =>
        btn.textContent.includes('Go Back')
      );
      expect(backButton).toBeTruthy();
    });

    it('should have Go to Home button', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btn');
      const homeButton = Array.from(buttons).find((btn: any) =>
        btn.textContent.includes('Go to Home')
      );
      expect(homeButton).toBeTruthy();
    });

    it('should have Contact Support button', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btn');
      const supportButton = Array.from(buttons).find((btn: any) =>
        btn.textContent.includes('Contact Support')
      );
      expect(supportButton).toBeTruthy();
    });
  });

  describe('Button Actions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should trigger goBack when back button is clicked', () => {
      spyOn(component, 'goBack');
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btn-secondary');
      buttons[0]?.click();
      expect(component.goBack).toHaveBeenCalled();
    });

    it('should trigger goHome when home button is clicked', () => {
      spyOn(component, 'goHome');
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btn-primary');
      buttons[0]?.click();
      expect(component.goHome).toHaveBeenCalled();
    });

    it('should trigger contactSupport when support button is clicked', () => {
      spyOn(component, 'contactSupport');
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btn-outline');
      buttons[0]?.click();
      expect(component.contactSupport).toHaveBeenCalled();
    });
  });

  describe('User Roles Display', () => {
    it('should display user roles when available', (done) => {
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const roleBadges = compiled.querySelectorAll('.role-badge');
        expect(roleBadges.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it('should display no roles message when user has no roles', (done) => {
      mockAuthService.user$ = of({ sub: 'test-user' } as any);
      fixture.detectChanges();

      setTimeout(() => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        const noRoles = compiled.querySelector('.no-roles');
        expect(noRoles?.textContent).toContain('No roles assigned');
        done();
      }, 100);
    });
  });
});
