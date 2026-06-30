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
$required = @("GEMINI_API_KEY", "STARTER_CREDITS", "ADMIN_TOPUP_SECRET", "SESSION_SECRET")
$pairs = foreach ($k in $required) {
    if (-not $envVars.ContainsKey($k)) { throw "$k mangler i .env" }
    "$k=$($envVars[$k])"
}
# Valgfrie Stripe-nokler: tas bare med hvis de er satt (tomme = "kjop kommer snart").
$optional = @("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET")
foreach ($k in $optional) {
    if ($envVars.ContainsKey($k) -and $envVars[$k]) { $pairs += "$k=$($envVars[$k])" }
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
