import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Create mock services
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout']);
    mockActivatedRoute = {
      snapshot: {
        queryParams: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be in logging in state initially', () => {
    expect(component['isLoggingIn']()).toBe(false);
  });

  it('should call authService.login() when login button is clicked', () => {
    component.login();
    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('should set isLoggingIn to true when login is called', () => {
    component.login();
    expect(component['isLoggingIn']()).toBe(true);
  });

  it('should store default redirect URL in session storage', () => {
    component.login();
    expect(sessionStorage.getItem('redirectUrl')).toBe('/');
  });

  it('should store returnUrl from query params in session storage', () => {
    mockActivatedRoute.snapshot.queryParams['returnUrl'] = '/dashboard';
    component.login();
    expect(sessionStorage.getItem('redirectUrl')).toBe('/dashboard');
  });

  it('should display "Sign In with Keycloak" text when not logging in', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sign In with Keycloak');
  });

  it('should display "Redirecting..." text when logging in', () => {
    component.login();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Redirecting...');
  });

  it('should disable button when logging in', () => {
    component.login();
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should enable button when not logging in', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it('should display welcome message', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Welcome Back');
  });

  it('should display info about Keycloak redirect', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('You will be redirected to Keycloak for authentication');
  });

  it('should have proper CSS classes', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.login-container')).toBeTruthy();
    expect(compiled.querySelector('.login-card')).toBeTruthy();
    expect(compiled.querySelector('.login-button')).toBeTruthy();
  });
});
