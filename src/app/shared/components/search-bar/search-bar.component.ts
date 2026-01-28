import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Search...';
  @Input() debounceTime: number = 300;
  @Output() search = new EventEmitter<string>();

  searchValue: string = '';
  private debounceTimer?: number;

  onSearchInput(value: string): void {
    this.searchValue = value;

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer for debounced search
    this.debounceTimer = window.setTimeout(() => {
      this.search.emit(value);
    }, this.debounceTime);
  }

  onSearchClear(): void {
    this.searchValue = '';
    this.search.emit('');
  }
}
