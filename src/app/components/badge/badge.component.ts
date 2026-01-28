import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="badge"
      [class]="'badge-' + variant + ' badge-' + size">
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 0.25em 0.6em;
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: 0.25rem;
    }

    .badge-sm { font-size: 0.75rem; padding: 0.2em 0.5em; }
    .badge-md { font-size: 0.875rem; padding: 0.25em 0.6em; }
    .badge-lg { font-size: 1rem; padding: 0.3em 0.7em; }

    .badge-primary { background-color: #3498db; color: white; }
    .badge-success { background-color: #2ecc71; color: white; }
    .badge-warning { background-color: #f39c12; color: white; }
    .badge-danger { background-color: #e74c3c; color: white; }
    .badge-info { background-color: #1abc9c; color: white; }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'primary';
  @Input() size: BadgeSize = 'md';
}
