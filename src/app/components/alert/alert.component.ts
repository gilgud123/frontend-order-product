import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type AlertType = 'success' | 'info' | 'warning' | 'error';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() dismissible: boolean = false;
  @Input() message: string = '';
  @Output() dismissed = new EventEmitter<void>();

  isVisible = true;

  dismiss(): void {
    this.isVisible = false;
    this.dismissed.emit();
  }
}
