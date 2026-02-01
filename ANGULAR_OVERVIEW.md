# Angular Overview — Linting, Deployment & Routing

This short reference covers three core topics for Angular projects: linting, deploying, and routing. Keep this file next to your README for quick onboarding or link to it from docs.

## Linting (what & why)
- Linting is automated static analysis that checks TypeScript/HTML/CSS for style issues, probable bugs, and consistency problems.
- Benefits: catches issues early, enforces team conventions, speeds up reviews, and can autofix many problems.

Common commands
```powershell
ng lint
ng lint --fix
# or run ESLint directly if configured:
npx eslint . --ext .ts,.html
```

Best practices
- Prefer ESLint with `@angular-eslint` (TSLint is deprecated).
- Add lint to CI and use `--fix` locally or via pre-commit hooks (husky + lint-staged).
- Keep rules strict for type-safety but pragmatic for developer productivity.

---

## Deploying (concise)
- Deploying means producing a production-ready build and publishing those artifacts to a host so users can load the app.
- Typical steps:
  1. Build production artifacts: `ng build --configuration production`.
  2. Configure runtime settings: `--base-href` for subpaths and environment-specific config.
  3. Publish `dist/<project>` to a host/CDN or run server for SSR.
  4. Ensure server rewrites for SPA routing and verify caching/service-worker behavior.

Common commands
```powershell
ng build --configuration production
ng deploy          # if a deploy builder is configured
# Example (GitHub Pages builder): ng add angular-cli-ghpages; ng deploy --base-href=/my-app/
```

Tips
- Use hashed filenames and a CDN for static assets.
- Automate build+deploy in CI (GitHub Actions, GitLab CI, Azure Pipelines).
- Never store secrets in client bundles; use secure backends.

---

## Routing (short)
- Routing connects URL paths to components or lazy-loaded modules and manages in-app navigation for SPAs.
- Key pieces: `Routes` array, `RouterModule.forRoot()`/`forChild()`, `<router-outlet>`, `routerLink`, and `Router.navigate()`.

Minimal example
```ts
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'orders/:id', component: OrderDetailComponent },
  { path: 'products', loadChildren: () => import('./products/products.module').then(m => m.ProductsModule) },
  { path: '**', redirectTo: '' }
];
```

Tips
- Lazy-load feature modules to reduce initial bundle size.
- Configure server rewrites (or use HashLocationStrategy) to avoid 404s on refresh.
- Use guards (`canActivate`, `canLoad`) for auth and `resolve` to prefetch data.

## Guards (short)
- Guards are services that control route access and behavior; they implement interfaces such as `CanActivate`, `CanActivateChild`, `CanDeactivate`, `CanLoad`, and `Resolve`.
- Common uses: authentication/authorization checks, preventing navigation with unsaved changes, and blocking lazy module loads when unauthorized.
- This project uses functional guards with the `inject()` function (modern Angular pattern).
- Minimal example:
```ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean | UrlTree {
    return this.auth.isLoggedIn() || this.router.parseUrl('/login');
  }
}

// Modern functional guard (used in this project):
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() || router.parseUrl('/login');
};
```
- Tip: Keep guards fast and side-effect free; return Observables/Promises for async checks and prefer `canLoad` to prevent unnecessary lazy-module downloads when unauthorized.
- **See [GUARDS_IMPLEMENTATION.md](./GUARDS_IMPLEMENTATION.md) for complete implementation guide and usage patterns.**

## Interceptors (short)
- Interceptors are services that intercept and transform HTTP requests/responses globally before they reach the server or application code.
- Common uses: adding auth tokens, logging, error handling, caching, loading indicators, retry logic, and modifying headers/bodies.
- This project uses functional interceptors with the `inject()` function (modern Angular pattern).

**How interceptors work:**
```
Request Flow:
  App → Interceptor(s) → HttpClient → Server
Response Flow:
  Server → HttpClient → Interceptor(s) → App
```

**Minimal example (functional interceptor):**
```ts
// Auth interceptor - adds token to every request
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req);
};

// Error interceptor - handles errors globally
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Redirect to login
      }
      return throwError(() => error);
    })
  );
};
```

**Registration (app.config.ts):**
```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
};
```

**Common interceptor patterns:**
- **Auth Token**: Attach JWT/OAuth tokens to requests
- **Error Handling**: Catch and handle HTTP errors globally (401, 403, 500)
- **Loading State**: Show/hide loading spinners
- **Retry Logic**: Retry failed requests with exponential backoff
- **Caching**: Cache GET requests to reduce server calls
- **Logging**: Log all HTTP traffic for debugging
- **Headers**: Add custom headers (Content-Type, API keys, correlation IDs)

**Tips:**
- Interceptors run in the order they're registered.
- Use `req.clone()` to modify requests (requests are immutable).
- Return `next(req)` to continue the chain.
- Use RxJS operators (`tap`, `catchError`, `retry`) for side effects.
- Keep interceptors focused on a single responsibility.

**This project's interceptors:**
- `authInterceptor` - Adds OAuth access token to requests
- `errorInterceptor` - Handles 401/403 errors and global error logging

---

If you want, I can:
- Append this doc to `README.md` instead of creating a separate file.
- Expand any section into a full guide (examples, CI snippets, or service-worker notes).
- Tailor deployment instructions to a specific host (Firebase, Netlify, GitHub Pages, AWS S3, etc.).

Saved as `ANGULAR_OVERVIEW.md` at the project root.
