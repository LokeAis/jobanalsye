# Deploy til Google Cloud Run.
# Leser runtime-secrets fra .env (som er git-ignorert) og kjorer gcloud.
# Bruk:  pwsh ./deploy.ps1    (eller hoyreklikk > Run with PowerShell)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$SERVICE = "bigfive"
$REGION  = "europe-north1"

# --- Les .env ---
if (-not (Test-Path ".env")) { throw ".env mangler. Kan ikke deploye uten secrets." }
$envVars = @{}
foreach ($line in Get-Content ".env") {
    if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
    $k, $v = $line -split '=', 2
    $k = $k.Trim()
    $v = $v.Trim().Trim('"').Trim("'")
    if ($k) { $envVars[$k] = $v }
}

# --- Runtime-variabler Cloud Run trenger (IKKE VITE_*, de bakes inn ved bygg;
#     IKKE FIREBASE_SERVICE_ACCOUNT, Cloud Run bruker runtime-identiteten). ---
$keys = @("GEMINI_API_KEY", "STARTER_CREDITS", "ADMIN_TOPUP_SECRET", "SESSION_SECRET")
$pairs = foreach ($k in $keys) {
    if (-not $envVars.ContainsKey($k)) { throw "$k mangler i .env" }
    "$k=$($envVars[$k])"
}
$setEnv = $pairs -join ","

Write-Host "Deployer $SERVICE til $REGION ..." -ForegroundColor Cyan
gcloud run deploy $SERVICE `
    --source . `
    --region $REGION `
    --allow-unauthenticated `
    --max-instances 5 `
    --quiet `
    --set-env-vars $setEnv

Write-Host "Ferdig." -ForegroundColor Green
