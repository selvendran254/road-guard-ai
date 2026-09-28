# RoadGuard AI — Android APK build script (Windows)
# Run from PowerShell:  cd apps\mobile\scripts  then  .\build-apk.ps1

$ErrorActionPreference = "Stop"
$MobileRoot = Split-Path $PSScriptRoot -Parent
$AndroidRoot = Join-Path $MobileRoot "android"
$SdkRoot = "$env:LOCALAPPDATA\Android\Sdk"

Write-Host "=== RoadGuard AI APK Builder ===" -ForegroundColor Red
Write-Host "Mobile: $MobileRoot"

if (-not (Test-Path $SdkRoot)) {
    Write-Host "ERROR: Android SDK not found. Install Android Studio first." -ForegroundColor Yellow
    Write-Host "https://developer.android.com/studio"
    exit 1
}

$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot

# Ensure native project exists
if (-not (Test-Path $AndroidRoot)) {
    Write-Host "Running expo prebuild..."
    Push-Location $MobileRoot
    npx expo prebuild --platform android --clean
    Pop-Location
}

# Install NDK if sdkmanager available
$sdkmanager = @(
    "$SdkRoot\cmdline-tools\latest\bin\sdkmanager.bat",
    "$SdkRoot\cmdline-tools\bin\sdkmanager.bat",
    "$SdkRoot\tools\bin\sdkmanager.bat"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($sdkmanager) {
    Write-Host "Installing NDK 27.1.12297006..."
    echo y | & $sdkmanager "ndk;27.1.12297006" "platform-tools" "platforms;android-36" "build-tools;36.0.0"
} else {
    Write-Host "Tip: Open Android Studio > SDK Manager > SDK Tools > NDK (Side by side) 27.1.12297006" -ForegroundColor Yellow
}

Write-Host "Building RELEASE APK with JS bundled inside (10-20 min)..."
Push-Location $AndroidRoot
.\gradlew.bat assembleRelease --no-daemon
Pop-Location

$apk = Join-Path $AndroidRoot "app\build\outputs\apk\release\app-release.apk"
$out = Join-Path $MobileRoot "RoadGuardAI.apk"

if (Test-Path $apk) {
    Copy-Item $apk $out -Force
    Write-Host ""
    Write-Host "SUCCESS! APK ready:" -ForegroundColor Green
    Write-Host $out
    Write-Host ""
    Write-Host "Install on phone: copy APK to phone and open it, or:"
    Write-Host "  adb install `"$out`""
} else {
    Write-Host "BUILD FAILED. See android\build logs." -ForegroundColor Red
    exit 1
}
