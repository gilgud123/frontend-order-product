import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination" *ngIf="totalPages > 1">
      <button [disabled]="currentPage === 0" (click)="onPageChange(currentPage - 1)">
        Previous
      </button>
      <span>Page {{ currentPage + 1 }} of {{ totalPages }}</span>
      <button [disabled]="currentPage === totalPages - 1" (click)="onPageChange(currentPage + 1)">
        Next
      </button>
    </div>
  `
})
export class PaginationComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
