import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export class KeycloakTestService {
  private http = inject(HttpClient);

  testConnection() {
    const url = 'http://localhost:8081/realms/product-rest-api/.well-known/openid-configuration';

    this.http.get(url).subscribe({
      next: (config) => console.log('✅ Keycloak connected:', config),
      error: (err) => console.error('❌ Keycloak connection failed:', err)
    });
  }
}
