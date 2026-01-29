import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  imports: [],
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CallbackComponent implements OnInit {
  private readonly router = inject(Router);

  protected readonly isProcessing = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      // Wait a bit to ensure OAuth flow is complete
      await this.waitForAuthentication();

      // Get the redirect URL from session storage
      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/';
      sessionStorage.removeItem('redirectUrl');

      this.isProcessing.set(false);

      // Navigate to the original destination
      await this.router.navigateByUrl(redirectUrl);
    } catch (error) {
      this.isProcessing.set(false);
      this.errorMessage.set('Authentication failed. Please try again.');
      console.error('Callback error:', error);

      // Redirect to home after error
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }
  }

  private async waitForAuthentication(): Promise<void> {
    return new Promise((resolve) => {
      // Give OAuth service time to process the callback
      setTimeout(resolve, 1000);
    });
  }
}
