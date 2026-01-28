# Manual Commands to Create core/ Folder Structure

## Step 1: Navigate to Angular Project Directory
```powershell
cd "C:\Users\Katya de Vries\IdeaProjects\frontend-order-product\frontend-order-rpoduct"
```

## Step 2: Create Directory Structure
```powershell
New-Item -ItemType Directory -Force -Path "src\app\core"
```

```powershell
New-Item -ItemType Directory -Force -Path "src\app\core\services"
```

```powershell
New-Item -ItemType Directory -Force -Path "src\app\core\interceptors"
```

```powershell
New-Item -ItemType Directory -Force -Path "src\app\core\guards"
```

```powershell
New-Item -ItemType Directory -Force -Path "src\app\core\config"
```

## Step 3: Generate Core Services
```powershell
npm run ng -- generate service core/services/api --skip-tests=false
```

```powershell
npm run ng -- generate service core/services/error-handler --skip-tests=false
```

```powershell
npm run ng -- generate service core/services/storage --skip-tests=false
```

## Step 4: Generate HTTP Interceptors (Functional)
```powershell
npm run ng -- generate interceptor core/interceptors/auth --functional
```

```powershell
npm run ng -- generate interceptor core/interceptors/error --functional
```

## Step 5: Generate Route Guards (Functional)
```powershell
npm run ng -- generate guard core/guards/auth --functional
```

```powershell
npm run ng -- generate guard core/guards/admin --functional
```

## Step 6: Create app.config.core.ts
```powershell
@'
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { errorInterceptor } from '../interceptors/error.interceptor';

export const coreConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
};
'@ | Set-Content -Path "src\app\core\config\app.config.core.ts" -Encoding UTF8
```

## Step 7: Create environment.type.ts
```powershell
@'
export interface Environment {
  production: boolean;
  apiUrl: string;
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
}
'@ | Set-Content -Path "src\app\core\config\environment.type.ts" -Encoding UTF8
```

## Step 8: Create index.ts (Barrel Exports)
```powershell
@'
// Core module barrel exports
export * from './services/api.service';
export * from './services/error-handler.service';
export * from './services/storage.service';
export * from './interceptors/auth.interceptor';
export * from './interceptors/error.interceptor';
export * from './guards/auth.guard';
export * from './guards/admin.guard';
export * from './config/environment.type';
'@ | Set-Content -Path "src\app\core\index.ts" -Encoding UTF8
```

## Final Directory Structure
```
src/app/core/
??? services/
?   ??? api.service.ts
?   ??? api.service.spec.ts
?   ??? error-handler.service.ts
?   ??? error-handler.service.spec.ts
?   ??? storage.service.ts
?   ??? storage.service.spec.ts
??? interceptors/
?   ??? auth.interceptor.ts
?   ??? auth.interceptor.spec.ts
?   ??? error.interceptor.ts
?   ??? error.interceptor.spec.ts
??? guards/
?   ??? auth.guard.ts
?   ??? auth.guard.spec.ts
?   ??? admin.guard.ts
?   ??? admin.guard.spec.ts
??? config/
?   ??? app.config.core.ts
?   ??? environment.type.ts
??? index.ts
```

## Verification Command
```powershell
# List all created files
Get-ChildItem -Path "src\app\core" -Recurse -File | Select-Object FullName
```

## Notes
- Execute commands one by one in PowerShell
- All commands use Angular 20's standalone architecture
- Interceptors and guards are functional (not class-based)
- Services use injectable classes with `@Injectable()`
