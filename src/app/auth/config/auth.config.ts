import {AuthConfig, JwksValidationHandler} from 'angular-oauth2-oidc';

const getOrigin = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:4200'; // fallback for SSR
};

export const authConfig: AuthConfig = {
  issuer: 'http://localhost:8081/realms/product-rest-api', // Changed to http for dev
  redirectUri: getOrigin() + '/index.html',
  postLogoutRedirectUri: getOrigin() + '/index.html',
  clientId: 'frontend-opa',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  requireHttps: false, // Now consistent with http issuer
  useSilentRefresh: true,
  silentRefreshRedirectUri: getOrigin() + '/silent-refresh.html',
  sessionChecksEnabled: true,
  // PKCE is enabled by default for response_type=code
  // S256 is the default code challenge method
};
