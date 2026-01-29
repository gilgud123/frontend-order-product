import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
  // Inputs
  placeholder = input<string>('Search...');
  debounceTime = input<number>(300);

  // Outputs
  search = output<string>();

  // State
  searchValue = signal<string>('');
  private debounceTimer?: number;

  onSearchInput(value: string): void {
    this.searchValue.set(value);

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer for debounced search
    this.debounceTimer = window.setTimeout(() => {
      this.search.emit(value);
    }, this.debounceTime());
  }

  onSearchClear(): void {
    this.searchValue.set('');
    this.search.emit('');
  }

  onKeyEnter(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.search.emit(this.searchValue());
  }
}
