import { Directive, input, TemplateRef, ViewContainerRef, inject, OnInit, effect } from '@angular/core';
import { AuthService } from '../../auth';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);

  // Input
  appHasRole = input<string | string[]>([]);

  constructor() {
    // React to changes in roles
    effect(() => {
      this.updateView();
    });
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const roles = this.appHasRole();
    const roleArray = Array.isArray(roles) ? roles : [roles];

    if (roleArray.length === 0 || this.authService.hasAnyRole(roleArray)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
