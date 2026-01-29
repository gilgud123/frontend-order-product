import { Directive, ElementRef, inject, AfterViewInit, input } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {
  private readonly el = inject(ElementRef);

  // Input
  appAutoFocus = input<boolean>(true);
  focusDelay = input<number>(0);

  ngAfterViewInit(): void {
    if (this.appAutoFocus()) {
      if (this.focusDelay() > 0) {
        setTimeout(() => {
          this.focus();
        }, this.focusDelay());
      } else {
        this.focus();
      }
    }
  }

  private focus(): void {
    const element = this.el.nativeElement;
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
}
