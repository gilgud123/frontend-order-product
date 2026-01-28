import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs">
      <div class="tabs-header">
        @for (tab of tabs; track tab.id) {
          <button
            class="tab-button"
            [class.active]="tab.id === activeTabId"
            [disabled]="tab.disabled"
            (click)="selectTab(tab.id)">
            {{ tab.label }}
          </button>
        }
      </div>
      <div class="tabs-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .tabs {
      width: 100%;
    }

    .tabs-header {
      display: flex;
      border-bottom: 2px solid #e9ecef;
      gap: 0.5rem;
    }

    .tab-button {
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-size: 1rem;
      color: #666;
      transition: all 0.2s;
      margin-bottom: -2px;

      &:hover:not(:disabled) {
        color: #3498db;
      }

      &.active {
        color: #3498db;
        border-bottom-color: #3498db;
        font-weight: 600;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .tabs-content {
      padding: 1.5rem 0;
    }
  `]
})
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Input() activeTabId: string = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(tabId: string): void {
    this.activeTabId = tabId;
    this.tabChange.emit(tabId);
  }
}
