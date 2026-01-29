import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../auth';
import { UserDTO } from '../../../models/user.model';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  // State signals
  users = signal<UserDTO[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Pagination signals
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  // Filter signals
  searchQuery = signal<string>('');

  // Computed values
  hasUsers = computed(() => this.users().length > 0);
  hasPreviousPage = computed(() => this.currentPage() > 0);
  hasNextPage = computed(() => this.currentPage() < this.totalPages() - 1);
  isAdmin = computed(() => this.authService.hasRole('ADMIN'));

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const query = this.searchQuery();
    const request = query
      ? this.userService.search(query, this.currentPage(), this.pageSize())
      : this.userService.getAll(this.currentPage(), this.pageSize());

    request.subscribe({
      next: (response: PaginatedResponse<UserDTO>) => {
        this.users.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load users. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading users:', err);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadUsers();
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          this.error.set('Failed to delete user.');
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(page => page - 1);
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(page => page + 1);
      this.loadUsers();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  getInitials(user: UserDTO): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getFullName(user: UserDTO): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected readonly Math = Math;
}
