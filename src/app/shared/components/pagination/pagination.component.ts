import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  // Inputs
  currentPage = input<number>(0);
  totalPages = input<number>(0);
  pageSize = input<number>(10);
  totalElements = input<number>(0);

  // Outputs
  pageChange = output<number>();

  // Computed values
  hasPreviousPage = computed(() => this.currentPage() > 0);
  hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);
  startItem = computed(() => this.currentPage() * this.pageSize() + 1);
  endItem = computed(() => Math.min((this.currentPage() + 1) * this.pageSize(), this.totalElements()));

  // Generate page numbers array for display (max 10 pages)
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxPages = 10;

    if (total <= maxPages) {
      return Array.from({ length: total }, (_, i) => i);
    }

    // Show ellipsis logic
    let start = Math.max(0, current - 4);
    let end = Math.min(total, start + maxPages);

    if (end - start < maxPages) {
      start = Math.max(0, end - maxPages);
    }

    return Array.from({ length: end - start }, (_, i) => start + i);
  });

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  protected readonly Math = Math;
}

