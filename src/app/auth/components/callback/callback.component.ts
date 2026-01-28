import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Get the redirect URL from session storage
    const redirectUrl = sessionStorage.getItem('redirectUrl') || '/';
    sessionStorage.removeItem('redirectUrl');

    // Navigate to the original destination
    this.router.navigateByUrl(redirectUrl);
  }
}
