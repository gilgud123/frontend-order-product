import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent implements OnInit {
  private readonly authService = inject(AuthService);

  protected readonly isProcessing = signal(true);
  protected readonly isComplete = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      // Add small delay for better UX
      await this.delay(500);

      // Perform logout
      this.authService.logout();

      this.isProcessing.set(false);
      this.isComplete.set(true);

      // Give user time to see success message
      await this.delay(1000);

      // Navigation is handled by AuthService
    } catch (error) {
      console.error('Logout error:', error);
      this.isProcessing.set(false);

      // Even on error, try to navigate home
      await this.delay(2000);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
