# Fix Node.js Version Warning

## The Warning
```
Node.js version v25.2.1 detected. Odd numbered Node.js versions will not enter LTS status 
and should not be used for production.
```

## ? Solution Applied (RECOMMENDED)

I've added the following configuration to `angular.json`:

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "cli": {
    "warnings": {
      "versionMismatch": false
    }
  },
  "projects": {
    ...
  }
}
```

This suppresses the version mismatch warning while keeping your current Node.js v25.2.1 installation.

## Alternative Solutions

### Option 1: Use Environment Variable (Temporary)
```powershell
# Set for current session only
$env:NG_DISABLE_VERSION_CHECK = "1"

# Then run your Angular commands
npm run start:proxy
```

### Option 2: Use Environment Variable (Permanent)
```powershell
# Set permanently in Windows
[System.Environment]::SetEnvironmentVariable('NG_DISABLE_VERSION_CHECK', '1', 'User')

# Restart your terminal/IDE for changes to take effect
```

### Option 3: Downgrade to Node.js LTS (Most Stable for Production)
If you want to use an LTS version for production stability:

1. **Download Node.js LTS**: https://nodejs.org/ (currently v22.x or v20.x)
2. **Use NVM (Node Version Manager)** for easy switching:
   ```powershell
   # Install NVM for Windows from: https://github.com/coreybutler/nvm-windows
   
   # Install LTS version
   nvm install lts
   
   # Use LTS version
   nvm use lts
   ```

### Option 4: Package.json Script Flag
Add the `--no-version-check` flag to individual npm scripts:

```json
{
  "scripts": {
    "start": "ng serve --no-version-check",
    "start:proxy": "ng serve --proxy-config ../proxy.conf.json --no-version-check",
    "build": "ng build --no-version-check"
  }
}
```

## Understanding the Warning

- **Odd numbered versions** (v25, v23, v21, etc.) are **development/current** releases
- **Even numbered versions** (v24, v22, v20, etc.) become **LTS (Long-Term Support)**
- LTS versions receive:
  - Security updates for 30 months
  - Critical bug fixes
  - Stable API
- Development versions are suitable for testing new features but not recommended for production

## Current Status

? **Warning is now suppressed** in your Angular configuration.

Your development workflow will continue normally without the warning appearing every time you run Angular CLI commands.

## Recommendation

For this development project, the current solution (suppressing the warning) is fine. 

For production deployments, consider:
- Using Node.js v22.x LTS (latest LTS)
- Or Node.js v20.x LTS (previous LTS, supported until April 2026)

