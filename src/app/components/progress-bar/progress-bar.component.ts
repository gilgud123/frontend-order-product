import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      @if (showLabel) {
        <div class="progress-label">
          <span>{{ label }}</span>
          <span>{{ value }}%</span>
        </div>
      }
      <div class="progress-bar">
        <div
          class="progress-fill"
          [style.width.%]="value"
          [class]="'progress-' + variant">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      width: 100%;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: #666;
    }

    .progress-bar {
      width: 100%;
      height: 1rem;
      background-color: #e9ecef;
      border-radius: 0.25rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .progress-primary { background-color: #3498db; }
    .progress-success { background-color: #2ecc71; }
    .progress-warning { background-color: #f39c12; }
    .progress-danger { background-color: #e74c3c; }
  `]
})
export class ProgressBarComponent {
  @Input() value: number = 0;
  @Input() label: string = '';
  @Input() showLabel: boolean = true;
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' = 'primary';
}
