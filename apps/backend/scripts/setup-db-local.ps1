# Sets up SQLite for local dev when Docker/PostgreSQL is not available.
$ErrorActionPreference = "Stop"
$backendRoot = Split-Path -Parent $PSScriptRoot
Set-Location $backendRoot

Write-Host "Setting up SQLite local database (no Docker required)..." -ForegroundColor Cyan

Copy-Item -Path ".env.sqlite" -Destination ".env" -Force

npx prisma generate --schema=prisma/schema.sqlite.prisma
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx prisma db push --schema=prisma/schema.sqlite.prisma
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx prisma db seed
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Done! Database: apps/backend/prisma/dev.db" -ForegroundColor Green
Write-Host "Start API: npm run dev" -ForegroundColor Green
Write-Host "Login: nick.fury@slooze.com / Password123!" -ForegroundColor Green
