import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    const mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    
    const mockLocation = {
      back: jasmine.createSpy('back')
    };

    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
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
      
      tick(10000); // Fast forward 10 seconds
      
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should clear interval on destroy', fakeAsync(() => {
      fixture.detectChanges();
      
      const initialCount = component.countdown();
      
      fixture.destroy(); // triggers ngOnDestroy
      
      tick(2000);
      
      // Countdown should not have changed after destroy
      expect(component.countdown()).toBe(initialCount - 1); // -1 because one tick happened before destroy
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
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display 404 error code', () => {
      const compiled = fixture.nativeElement;
      const errorCode = compiled.querySelector('.error-code');
      expect(errorCode?.textContent).toContain('404');
    });

    it('should display error title', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('.error-title');
      expect(title?.textContent).toContain('Page Not Found');
    });

    it('should display countdown value', () => {
      const compiled = fixture.nativeElement;
      const countdown = compiled.querySelector('.countdown');
      expect(countdown?.textContent).toContain('10');
    });

    it('should update countdown in template', fakeAsync(() => {
      tick(1000);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const countdown = compiled.querySelector('.countdown');
      expect(countdown?.textContent).toContain('9');
    }));

    it('should have "Go to Home" button', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btn-primary');
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]?.textContent).toContain('Go to Home');
    });

    it('should have "Go Back" button', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.btn-secondary');
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0]?.textContent).toContain('Go Back');
    });

    it('should trigger goHome when home button is clicked', () => {
      spyOn(component, 'goHome');
      const compiled = fixture.nativeElement;
      const homeButton = compiled.querySelector('.btn-primary');
      homeButton?.click();
      expect(component.goHome).toHaveBeenCalled();
    });

    it('should trigger goBack when back button is clicked', () => {
      spyOn(component, 'goBack');
      const compiled = fixture.nativeElement;
      const backButton = compiled.querySelector('.btn-secondary');
      backButton?.click();
      expect(component.goBack).toHaveBeenCalled();
    });

    it('should display helpful links', () => {
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
