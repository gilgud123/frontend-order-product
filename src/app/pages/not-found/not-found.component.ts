import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  
  countdown = signal<number>(10);
  private intervalId?: number;

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  private startCountdown(): void {
    this.intervalId = window.setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        this.clearCountdown();
        this.goHome();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    this.location.back();
  }
}
