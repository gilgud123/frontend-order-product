# PowerShell script to add provideRouter and provideZoneChangeDetection to test files

$testFiles = Get-ChildItem -Path "src" -Filter "*.spec.ts" -Recurse

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false

    # Skip if already has provideRouter
    if ($content -match "provideRouter") {
        Write-Host "Skipping $($file.Name) - already has provideRouter"
        continue
    }

    # Check if file has TestBed.configureTestingModule
    if ($content -notmatch "TestBed\.configureTestingModule") {
        Write-Host "Skipping $($file.Name) - no TestBed configuration"
        continue
    }

    # Add imports if not present
    if ($content -match "import.*from '@angular/core/testing'") {
        # Add provideZoneChangeDetection import if needed
        if ($content -notmatch "provideZoneChangeDetection") {
            $content = $content -replace "(import.*from '@angular/core/testing';)", "`$1`nimport { provideZoneChangeDetection } from '@angular/core';"
            $modified = $true
        }

        # Add provideRouter import if needed and file imports Router
        if (($content -match "from '@angular/router'") -and ($content -notmatch "provideRouter")) {
            $content = $content -replace "(import.*Router.*from '@angular/router';)", "`$1"
            $content = $content -replace "(import.*from '@angular/router';)", "import { Router, provideRouter } from '@angular/router';"
            $modified = $true
        }
    }

    # Add providers to TestBed if it has a providers array
    if ($content -match "providers:\s*\[") {
        # Add provideZoneChangeDetection
        if ($content -notmatch "provideZoneChangeDetection") {
            $content = $content -replace "(providers:\s*\[)", "`$1`n        provideZoneChangeDetection({ eventCoalescing: true }),"
            $modified = $true
        }

        # Add provideRouter if Router is imported
        if (($content -match "from '@angular/router'") -and ($content -notmatch "provideRouter\(\[\]\)")) {
            $content = $content -replace "(providers:\s*\[\s*\n\s*provideZoneChangeDetection[^\n]*\n)", "`$1        provideRouter([]),`n"
            $modified = $true
        }
    }

    if ($modified) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "Updated $($file.Name)"
    }
}

Write-Host "Done!"

