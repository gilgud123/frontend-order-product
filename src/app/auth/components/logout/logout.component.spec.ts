import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LogoutComponent } from './logout.component';
import { AuthService } from '../../services/auth.service';

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Create mock service
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [LogoutComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in processing state initially', () => {
    expect(component['isProcessing']()).toBe(true);
    expect(component['isComplete']()).toBe(false);
  });

  it('should call authService.logout() on init', fakeAsync(() => {
    fixture.detectChanges();
    tick(500); // Wait for initial delay

    expect(mockAuthService.logout).toHaveBeenCalled();
  }));

  it('should transition from processing to complete state', fakeAsync(() => {
    fixture.detectChanges();
    expect(component['isProcessing']()).toBe(true);

    tick(500); // Wait for initial delay
    expect(component['isProcessing']()).toBe(false);
    expect(component['isComplete']()).toBe(true);
  }));

  it('should display processing message initially', fakeAsync(() => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Logging Out');
    expect(compiled.textContent).toContain('Please wait while we securely log you out...');
  }));

  it('should display success message after logout', fakeAsync(() => {
    fixture.detectChanges();
    tick(500); // Wait for initial delay
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Logged Out Successfully');
    expect(compiled.textContent).toContain('You have been securely logged out');
  }));

  it('should show spinner while processing', fakeAsync(() => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.spinner')).toBeTruthy();
  }));

  it('should show success icon after completion', fakeAsync(() => {
    fixture.detectChanges();
    tick(500); // Wait for initial delay
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.success-icon')).toBeTruthy();
  }));

  it('should handle logout errors gracefully', fakeAsync(() => {
    mockAuthService.logout.and.throwError('Logout failed');

    fixture.detectChanges();
    tick(500); // Wait for initial delay

    expect(component['isProcessing']()).toBe(false);

    tick(2000); // Wait for error delay
    // Component should still handle the error without crashing
    expect(component).toBeTruthy();
  }));

  it('should have proper CSS classes', fakeAsync(() => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.logout-container')).toBeTruthy();
    expect(compiled.querySelector('.logout-card')).toBeTruthy();
  }));

  it('should complete full logout flow', fakeAsync(() => {
    fixture.detectChanges();

    // Initial state
    expect(component['isProcessing']()).toBe(true);
    expect(component['isComplete']()).toBe(false);

    // After initial delay
    tick(500);
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(component['isProcessing']()).toBe(false);
    expect(component['isComplete']()).toBe(true);

    // After success message delay
    tick(1000);
    expect(component['isComplete']()).toBe(true);
  }));
});
