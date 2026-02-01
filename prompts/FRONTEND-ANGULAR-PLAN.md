# Angular Frontend Integration Plan

Goal
----
Create an Angular single-page application (SPA) that integrates with the existing Spring Boot REST API in this repository, uses Keycloak for authentication (OAuth2 / OIDC Authorization Code + PKCE), runs in dev with a proxy to the backend, and can either be served separately or packaged into the Spring Boot jar for simple deployments.

High-level assumptions
---------------------
- Angular: 16 (adjustable to 17 if you prefer)
- Node: 18.x (Node 20 is also fine)
- Auth: Keycloak as IdP; backend configured as an OAuth2 resource server
- Backend base URL in dev: `http://localhost:8080/api`
- Project root (where this file is created): `C:\Users\katya\IdeaProjects\OrderService-ProductService-Repository`

Quick checklist (execute in order)
----------------------------------
1. Prepare environment
2. Scaffold Angular app
3. Install libraries
4. Add dev proxy (`proxy.conf.json`)
5. Create app structure (core/auth/shared/models/services/pages)
6. Create TypeScript models from backend DTOs
7. Implement HTTP services (Products, Users, Orders)
8. Implement authentication (angular-oauth2-oidc + Keycloak)
9. Add HTTP interceptor and route guards
10. Build CRUD pages and components
11. Run dev server with backend (proxy or concurrently)
12. Adjust backend CORS / security if needed
13. Production build & integration options (copy to backend static or Docker)
14. Tests, linting, CI/CD

Detailed step-by-step plan
--------------------------

1) Preparation
---------------
- Verify Node and npm:

```powershell
node -v
npm -v
```

- Optional: install Angular CLI globally (npx is fine):

```powershell
npm i -g @angular/cli@16
```

2) Scaffold Angular app
-----------------------
- From project root:

```powershell
cd C:\Users\katya\IdeaProjects\OrderService-ProductService-Repository
npx -y @angular/cli@16 new frontend --routing true --style scss --skip-tests false --strict true
cd .\frontend
```

- Result: `frontend/` created with Angular project scaffold.

3) Install recommended libraries
--------------------------------
- Recommended core libraries and dev tools:

```powershell
# Core auth + helpers
npm install angular-oauth2-oidc keycloak-js

# Optional JWT helper
npm install @auth0/angular-jwt

# Dev & niceties
npm install --save-dev concurrently eslint prettier eslint-config-prettier cypress
```

- Rationale: `angular-oauth2-oidc` is recommended for OIDC + PKCE flows; `keycloak-js` is optional; `@auth0/angular-jwt` helps token parsing for some use cases.

4) Create dev proxy to forward `/api` to Spring Boot
----------------------------------------------------
- Create `frontend/proxy.conf.json` with content below (from `frontend` folder):

```powershell
@'
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
'@ | Set-Content -Path .\proxy.conf.json -Encoding utf8
```

- Start Angular dev server with proxy:

```powershell
npm run start -- --proxy-config proxy.conf.json
```

- Or add to `package.json` scripts:

```json
"start:proxy": "ng serve --proxy-config proxy.conf.json"
```

and run:

```powershell
npm run start:proxy
```

5) Project structure (recommended)
----------------------------------
Organize `frontend/src/app` as:
- core/       — singletons, ApiService, interceptors, app initializer
- auth/       — AuthService, AuthModule, route guards
- shared/     — shared components, pipes, directives
- models/     — DTO interfaces (UserDTO, ProductDTO, OrderDTO, CustomerRevenueDTO)
- services/   — ProductService, UserService, OrderService
- pages/      — Products, Users, Orders, Dashboard
- components/ — small reusable UI pieces

Use `ng generate` or your IDE to scaffold modules, components, and services.

6) TypeScript models (map from backend DTOs)
--------------------------------------------
Place these in `frontend/src/app/models/`.

- user.model.ts

```ts
export interface UserDTO {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

- product.model.ts

```ts
export interface ProductDTO {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

- order.model.ts

```ts
export interface OrderDTO {
  id?: number;
  userId: number;
  productIds: number[];
  totalAmount?: number;
  status?: string; // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  createdAt?: string;
  updatedAt?: string;
}
```

- customer-revenue.model.ts

```ts
export interface CustomerRevenueDTO {
  customerId: number;
  year: number;
  totalRevenue: number;
}
```

Notes: Use `number` for numeric values. If monetary precision is critical, consider string representations and parse carefully in the UI.

7) HTTP services (in `src/app/services/`)
-----------------------------------------
- Implement typed services using `HttpClient` and return `Observable<T>`.
- Example ProductService method signatures:
  - getAll(page: number, size: number)
  - getById(id: number)
  - search(query: string, page: number, size: number)
  - filter(filters, page, size)
  - create(product: ProductDTO)
  - update(id: number, product: ProductDTO)
  - delete(id: number)

- UserService and OrderService follow similar patterns. Include centralized error handling in an ApiService or BaseService.

8) Authentication: Keycloak + OIDC PKCE
--------------------------------------
- Recommended Keycloak client settings (Admin Console):
  - Realm: `product-rest-api` (as in README)
  - Client ID: `frontend-opa`
  - Client protocol: `openid-connect`
  - Access Type: `public`
  - Standard Flow Enabled: ON (Authorization Code)
  - Valid Redirect URIs: `http://localhost:4200/*`
  - Web Origins: `http://localhost:4200`
  - Realm Roles: `USER`, `ADMIN` (as in backend)

- Example `auth.config.ts` for `angular-oauth2-oidc`:

```ts
export const authConfig: AuthConfig = {
  issuer: 'https://localhost:8081/realms/product-rest-api',
  redirectUri: window.location.origin,
  clientId: 'frontend-opa',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  requireHttps: false, // set true in production
  usePkce: true
};
```

- AuthService minimal init:

```ts
constructor(private oauthService: OAuthService) {
  this.oauthService.configure(authConfig);
  this.oauthService.loadDiscoveryDocumentAndTryLogin();
}
login() { this.oauthService.initCodeFlow(); }
logout() { this.oauthService.logOut(); }
getAccessToken() { return this.oauthService.getAccessToken(); }
```

9) Token injection & route guards
--------------------------------
- HttpInterceptor to add `Authorization: Bearer <token>` header to `/api` requests.

```ts
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = this.authService.getAccessToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next.handle(authReq);
}
```

- AuthGuard example:

```ts
canActivate(): boolean {
  return this.oauthService.hasValidAccessToken();
}
```

- AdminGuard: check identity claims for `realm_access.roles` or a custom claim.

10) Pages & components (CRUD)
-----------------------------
- Products
  - ProductListComponent — GET `/api/products` (with paging, search, filter)
  - ProductDetailComponent — GET `/api/products/{id}`
  - ProductFormComponent — POST/PUT for create/update (admin only)
- Users
  - UserListComponent, UserDetailComponent, UserFormComponent (admin)
- Orders
  - OrderListComponent, OrderDetailComponent, CreateOrderComponent
  - Admin-only: update status via PATCH `/api/orders/{id}/status`
  - CustomerRevenuePage -> GET `/api/orders/customer/{customerId}/revenue`

11) Dev-time workflow with backend
----------------------------------
- Option A (two terminals, recommended):
  - Terminal 1 (backend): from project root

```powershell
cd C:\Users\katya\IdeaProjects\OrderService-ProductService-Repository
.\mvnw.cmd spring-boot:run
```

  - Terminal 2 (frontend): from `frontend` folder

```powershell
npm run start:proxy
```

- Option B (single command using `concurrently`) from `frontend`:

```powershell
npm install --save-dev concurrently
npm set-script dev "concurrently \"ng serve --proxy-config proxy.conf.json\" \"powershell -NoProfile -Command 'cd .. ; .\\mvnw.cmd spring-boot:run'\""
npm run dev
```

12) Backend CORS & security adjustments (if required)
----------------------------------------------------
- Files to edit (minimal changes):
  - `src/main/resources/application.yml` or `application.properties` — add Keycloak issuer and resource-server settings:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://localhost:8081/realms/product-rest-api
```

  - `src/main/java/com/katya/test/productrestassignement/config/SecurityConfig.java` — add CORS configuration and register it with Spring Security. Example bean to add:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:4200"));
    config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

and in the HttpSecurity chain:

```java
http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
```

13) Production build & integration
----------------------------------
Option A — Single artifact (recommended for simple deploys):
- Build Angular production bundle and copy to backend static resources.

```powershell
# from frontend
npm run build -- --configuration production
# clear backend static (be careful)
Remove-Item -Recurse -Force ..\src\main\resources\static\* -ErrorAction SilentlyContinue
Copy-Item -Path .\dist\frontend\* -Destination ..\src\main\resources\static -Recurse
# from project root
.\mvnw.cmd -B package
```

- Or set `angular.json` build `outputPath` to `../src/main/resources/static` to write directly into backend static folder.

Option B — Separate deployments (recommended for production scale):
- Build frontend Docker image (nginx serving files) and backend image, orchestrate with Docker Compose or Kubernetes. Update `compose.yaml` accordingly.

14) Testing & quality
---------------------
- Angular unit tests: Jest (recommended) or Karma/Jasmine (default).
- E2E: Cypress.
- Lint/format: ESLint + Prettier. Add scripts:

```json
"lint": "eslint . --ext .ts",
"test": "ng test",
"e2e": "cypress open"
```

- CI (GitHub Actions) high-level steps:
  1. Checkout
  2. Setup Node 18
  3. npm install, run lint and tests, build frontend
  4. Copy dist to backend static (if combined artifact)
  5. Setup Java (Temurin 17) and mvn package
  6. Optionally build Docker images and push

I can provide a sample `ci.yml` on request.

15) Mapping matrix (backend endpoints -> frontend pages & service methods)
---------------------------------------------------------------------------
Products
- GET `/api/products` -> ProductListComponent -> ProductService.getAll(page,size)
- GET `/api/products/{id}` -> ProductDetailComponent -> ProductService.getById(id)
- GET `/api/products/search?query=` -> ProductService.search(query)
- GET `/api/products/filter?category&minPrice&maxPrice` -> ProductService.filter(filters)
- POST `/api/products` -> ProductFormComponent -> ProductService.create(product)
- PUT `/api/products/{id}` -> ProductFormComponent -> ProductService.update(id,product)
- DELETE `/api/products/{id}` -> ProductService.delete(id)

Users
- GET `/api/users` -> UserListComponent -> UserService.getAll
- GET `/api/users/{id}` -> UserDetailComponent -> UserService.getById
- GET `/api/users/search?query=` -> UserService.search
- POST `/api/users` -> UserFormComponent -> UserService.create

Orders
- GET `/api/orders` -> OrdersPage -> OrderService.getAll
- GET `/api/orders/{id}` -> OrderDetailComponent -> OrderService.getById
- GET `/api/orders/user/{userId}` -> MyOrdersPage -> OrderService.getByUser
- POST `/api/orders` -> CreateOrderComponent -> OrderService.create
- PATCH `/api/orders/{id}/status?status=` -> Admin orders UI -> OrderService.updateStatus
- GET `/api/orders/customer/{customerId}/revenue` -> CustomerRevenuePage -> OrderService.getCustomerRevenue

16) Time estimates (rough)
--------------------------
- Scaffold + install deps: 0.5–1 hour
- Models & services (basic): 1–2 hours
- Auth integration (Keycloak OIDC + PKCE): 4–8 hours
- Core CRUD pages (happy path): 12–20 hours
- Role UI & guards: 3–6 hours
- Testing (unit + basic E2E): 8–12 hours
- Production integration & CI/CD: 4–8 hours
- Total rough: 32–57 hours (4–8 working days)

Backend files you will likely edit
----------------------------------
- `src/main/resources/application.yml` or `application.properties` — add `spring.security.oauth2.resourceserver.jwt.issuer-uri` for Keycloak
- `src/main/java/com/katya/test/productrestassignement/config/SecurityConfig.java` — add CORS configuration and register with `HttpSecurity`

Small code snippets (copyable)
------------------------------
- angular-oauth2-oidc init (auth.service.ts):

```ts
this.oauthService.configure(authConfig);
this.oauthService.loadDiscoveryDocumentAndTryLogin();

login() { this.oauthService.initCodeFlow(); }
logout() { this.oauthService.logOut(); }
getAccessToken() { return this.oauthService.getAccessToken(); }
```

- HTTP interceptor (attach token):

```ts
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = this.authService.getAccessToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next.handle(authReq);
}
```

- Example Keycloak client minimal settings (Admin Console):
  - Client ID: `frontend-opa`
  - Access Type: `public`
  - Valid Redirect URIs: `http://localhost:4200/*`
  - Web Origins: `http://localhost:4200`
  - Standard Flow: ON (Authorization Code)

CI/CD recommendations
---------------------
- Combined artifact: build Angular, copy to `src/main/resources/static`, then `mvn -B package` => single jar.
- Separate artifacts: build frontend Docker image (nginx), build backend jar image, push both to registry and deploy with Docker Compose or Kubernetes.

Next steps I can take for you
----------------------------
- Scaffold the Angular app (`frontend/`) and install deps.
- Create `proxy.conf.json` and add example `package.json` scripts.
- Create skeleton `models/`, `services/`, and minimal `auth` bootstrap files.
- Create suggested `application.yml` or `SecurityConfig` edits as a patch (if you want me to modify backend).

If you want me to proceed and scaffold the frontend now, reply `Proceed` and confirm:
- Angular version: 20 (standalone components, signals, modern patterns)
- Node preference: 20 or 22
- Auth library choice: `angular-oauth2-oidc` v15+ (recommended for Angular 20)

---

**Key Angular 20 Features Used:**
- Standalone components (no NgModules required)
- Functional guards and interceptors
- Modern `inject()` function for DI
- Signals for reactive state management
- TypeScript 5.5+ support
- Enhanced performance and build optimizations

Created by plan generator. Updated for Angular 20. If you'd like adjustments (different auth approach, signals vs observables preference, or deployment strategy), tell me and I will update the plan accordingly.

