import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly isLoggingIn = signal(false);

  login(): void {
    this.isLoggingIn.set(true);

    // Store the redirect URL from query params or use default
    const redirectUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    sessionStorage.setItem('redirectUrl', redirectUrl);

    // Initiate OAuth login flow
    this.authService.login();
  }
}
