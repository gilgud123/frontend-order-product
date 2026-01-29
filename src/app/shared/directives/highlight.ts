import { Directive, ElementRef, Renderer2, inject, input, effect, HostListener } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  // Inputs
  appHighlight = input<string>('#ffeb3b');
  highlightOnHover = input<boolean>(false);

  constructor() {
    // React to changes in highlight color
    effect(() => {
      if (!this.highlightOnHover()) {
        this.applyHighlight(this.appHighlight());
      }
    });
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.highlightOnHover()) {
      this.applyHighlight(this.appHighlight());
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.highlightOnHover()) {
      this.removeHighlight();
    }
  }

  private applyHighlight(color: string): void {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.3s ease');
  }

  private removeHighlight(): void {
    this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor');
  }
}
