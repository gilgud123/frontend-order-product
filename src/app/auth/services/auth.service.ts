import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';
import { BehaviorSubject, filter, map } from 'rxjs';
import { authConfig } from '../config/auth.config';
import { AuthState, UserProfile } from '../auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly oauthService = inject(OAuthService);
  private readonly router = inject(Router);

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    roles: []
  });

  public authState$ = this.authStateSubject.asObservable();
  public isAuthenticated$ = this.authState$.pipe(map(state => state.isAuthenticated));
  public user$ = this.authState$.pipe(map(state => state.user));

  constructor() {
    this.configureOAuth();
    this.setupEventListeners();
  }

  private configureOAuth(): void {
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();
    this.loadDiscoveryDocumentAndTryLogin();
  }

  private setupEventListeners(): void {
    this.oauthService.events
      .pipe(filter((e: OAuthEvent) => e.type === 'token_received'))
      .subscribe(() => this.updateAuthState());

    this.oauthService.events
      .pipe(filter((e: OAuthEvent) => e.type === 'logout'))
      .subscribe(() => this.clearAuthState());
  }

  private async loadDiscoveryDocumentAndTryLogin(): Promise<void> {
    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      if (this.oauthService.hasValidAccessToken()) {
        this.updateAuthState();
      }
    } catch (error) {
      console.error('Error loading discovery document:', error);
    }
  }

  private updateAuthState(): void {
    const claims = this.oauthService.getIdentityClaims() as UserProfile;
    const roles = claims?.realm_access?.roles || [];

    this.authStateSubject.next({
      isAuthenticated: this.oauthService.hasValidAccessToken(),
      user: claims,
      accessToken: this.oauthService.getAccessToken(),
      roles
    });
  }

  private clearAuthState(): void {
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      roles: []
    });
  }

  public login(): void {
    this.oauthService.initCodeFlow();
  }

  public logout(): void {
    this.oauthService.logOut();
    this.router.navigate(['/']);
  }

  public getAccessToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  public hasRole(role: string): boolean {
    const state = this.authStateSubject.value;
    return state.roles.includes(role);
  }

  public hasAnyRole(roles: string[]): boolean {
    const state = this.authStateSubject.value;
    return roles.some(role => state.roles.includes(role));
  }

  public isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  public getUserProfile(): UserProfile | null {
    return this.authStateSubject.value.user;
  }
}
