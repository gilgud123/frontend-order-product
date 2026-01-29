import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnauthorizedComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly authService = inject(AuthService);

  // State signals
  attemptedUrl = signal<string>('');
  userRoles = signal<string[]>([]);

  // Computed values
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  hasRoles = computed(() => this.userRoles().length > 0);

  ngOnInit(): void {
    // Try to get the attempted URL from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['url']) {
      this.attemptedUrl.set(navigation.extras.state['url']);
    }

    // Get user roles if authenticated
    this.authService.user$.subscribe({
      next: (user) => {
        if (user?.realm_access?.roles) {
          this.userRoles.set(user.realm_access.roles);
        }
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  contactSupport(): void {
    // Could open a support modal or navigate to a contact page
    alert('Please contact your administrator for access permissions.');
  }
}
