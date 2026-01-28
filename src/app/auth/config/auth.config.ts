import { AuthConfig } from 'angular-oauth2-oidc';

const getOrigin = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:4200'; // fallback for SSR
};

export const authConfig: AuthConfig = {
  issuer: 'https://localhost:8081/realms/product-rest-api',
  redirectUri: getOrigin() + '/callback',
  clientId: 'frontend-spa',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  requireHttps: false, // set true in production
  useSilentRefresh: true,
  silentRefreshRedirectUri: getOrigin() + '/silent-refresh.html',
  sessionChecksEnabled: true,
  clearHashAfterLogin: true,
  // PKCE is enabled by default when using responseType: 'code'
  // To explicitly disable PKCE, set: disablePKCE: true
};
