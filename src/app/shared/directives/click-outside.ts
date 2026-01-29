import { Directive, ElementRef, inject, output, HostListener } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  private readonly el = inject(ElementRef);

  // Output
  appClickOutside = output<void>();

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: EventTarget | null): void {
    if (!targetElement) return;

    const clickedInside = this.el.nativeElement.contains(targetElement as Node);
    if (!clickedInside) {
      this.appClickOutside.emit();
    }
  }
}
