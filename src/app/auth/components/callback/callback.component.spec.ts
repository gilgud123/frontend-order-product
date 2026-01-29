import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CallbackComponent } from './callback.component';
import { AuthService } from '../../services/auth.service';

describe('CallbackComponent', () => {
  let component: CallbackComponent;
  let fixture: ComponentFixture<CallbackComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Create mock services
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout']);

    // Setup mock returns
    mockRouter.navigateByUrl.and.returnValue(Promise.resolve(true));
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [CallbackComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CallbackComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show processing state initially', () => {
    expect(component['isProcessing']()).toBe(true);
    expect(component['errorMessage']()).toBeNull();
  });

  it('should process authentication and redirect to stored URL', fakeAsync(() => {
    const redirectUrl = '/dashboard';
    sessionStorage.setItem('redirectUrl', redirectUrl);

    fixture.detectChanges();
    tick(1000); // Wait for authentication processing

    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(redirectUrl);
    expect(sessionStorage.getItem('redirectUrl')).toBeNull();
    expect(component['isProcessing']()).toBe(false);
  }));

  it('should redirect to home when no redirectUrl is stored', fakeAsync(() => {
    sessionStorage.removeItem('redirectUrl');

    fixture.detectChanges();
    tick(1000); // Wait for authentication processing

    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
    expect(component['isProcessing']()).toBe(false);
  }));

  it('should handle authentication errors', fakeAsync(() => {
    mockRouter.navigateByUrl.and.returnValue(Promise.reject(new Error('Navigation failed')));

    fixture.detectChanges();
    tick(1000); // Wait for authentication processing

    expect(component['isProcessing']()).toBe(false);
    expect(component['errorMessage']()).toBe('Authentication failed. Please try again.');

    tick(3000); // Wait for error redirect
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should display processing message in template', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.callback-title');

    expect(title?.textContent).toContain('Processing Authentication');
  });

  it('should display error message when authentication fails', fakeAsync(() => {
    mockRouter.navigateByUrl.and.returnValue(Promise.reject(new Error('Auth failed')));

    fixture.detectChanges();
    tick(1000);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.callback-title');

    expect(title?.textContent).toContain('Authentication Failed');
    expect(component['errorMessage']()).toBe('Authentication failed. Please try again.');
  }));

  it('should clean up session storage after successful redirect', fakeAsync(() => {
    sessionStorage.setItem('redirectUrl', '/orders');

    fixture.detectChanges();
    tick(1000);

    expect(sessionStorage.getItem('redirectUrl')).toBeNull();
  }));

  afterEach(() => {
    sessionStorage.clear();
  });
});
