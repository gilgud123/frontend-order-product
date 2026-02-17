import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { provideZoneChangeDetection } from '@angular/core';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    const mockLocation = {
      back: jasmine.createSpy('back')
    };

    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter([]),
        { provide: Location, useValue: mockLocation }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    location = TestBed.inject(Location);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Countdown', () => {
    it('should initialize countdown at 10 seconds', () => {
      expect(component.countdown()).toBe(10);
    });

    it('should start countdown on init', fakeAsync(() => {
      fixture.detectChanges(); // triggers ngOnInit

      expect(component.countdown()).toBe(10);

      tick(1000);
      expect(component.countdown()).toBe(9);

      tick(1000);
      expect(component.countdown()).toBe(8);
    }));

    it('should navigate to home when countdown reaches 0', fakeAsync(() => {
      fixture.detectChanges();

      // Tick 10 times (1 second each) to reach 0
      for (let i = 0; i < 10; i++) {
        tick(1000);
      }

      // Tick one more time to trigger the navigation when countdown is 0
      tick(1000);

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should clear interval on destroy', fakeAsync(() => {
      fixture.detectChanges();

      // Let countdown tick once
      tick(1000);
      expect(component.countdown()).toBe(9);

      // Destroy the component
      fixture.destroy();

      // Try to tick again
      tick(2000);

      // Countdown should still be 9 (not changed after destroy)
      expect(component.countdown()).toBe(9);
    }));
  });

  describe('Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to home when goHome is called', () => {
      component.goHome();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should call location.back when goBack is called', () => {
      component.goBack();
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('Template', () => {
    it('should display 404 error code', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const errorCode = compiled.querySelector('.error-code');
      expect(errorCode?.textContent).toContain('404');
    });

    it('should display error title', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('.error-title');
      expect(title?.textContent).toContain('Page Not Found');
    });

    it('should display countdown value', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const countdown = compiled.querySelector('.countdown');
      expect(countdown?.textContent).toContain('10');
    });

    it('should update countdown in template', fakeAsync(() => {
      // Create a fresh fixture within fakeAsync context
      const testFixture = TestBed.createComponent(NotFoundComponent);
      const testComponent = testFixture.componentInstance;
      const compiled = testFixture.nativeElement;

      // Verify initial state
      expect(testComponent.countdown()).toBe(10);

      // Trigger ngOnInit to start countdown in fakeAsync context
      testFixture.detectChanges();

      // Tick 1 second to trigger countdown update
      tick(1000);
      testFixture.detectChanges();

      // Component countdown should have decremented
      expect(testComponent.countdown()).toBe(9);

      // Template should reflect the change
      const countdown = compiled.querySelector('.countdown');
      expect(countdown?.textContent).toContain('9');

      // Clean up any remaining timers
      testFixture.destroy();
      flush();
    }));

    it('should have "Go to Home" button', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btn-primary');
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]?.textContent).toContain('Go to Home');
    });

    it('should have "Go Back" button', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btn-secondary');
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]?.textContent).toContain('Go Back');
    });

    it('should trigger goHome when home button is clicked', () => {
      fixture.detectChanges();
      spyOn(component, 'goHome');
      const compiled = fixture.nativeElement;
      const homeButton = compiled.querySelector('.btn-primary');
      homeButton?.click();
      expect(component.goHome).toHaveBeenCalled();
    });

    it('should trigger goBack when back button is clicked', () => {
      fixture.detectChanges();
      spyOn(component, 'goBack');
      const compiled = fixture.nativeElement;
      const backButton = compiled.querySelector('.btn-secondary');
      backButton?.click();
      expect(component.goBack).toHaveBeenCalled();
    });

    it('should display helpful links', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const links = compiled.querySelectorAll('.helpful-links a');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Lifecycle', () => {
    it('should clean up interval on destroy', fakeAsync(() => {
      fixture.detectChanges();
      const spy = spyOn(window, 'clearInterval');

      fixture.destroy();

      expect(spy).toHaveBeenCalled();
    }));
  });
});
