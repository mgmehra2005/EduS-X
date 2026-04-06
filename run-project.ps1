# EduS-X Project Startup Script
# This script builds and runs the EduS-X project using Docker Compose

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  EduS-X Project Startup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker daemon..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        docker ps *>$null
        Write-Host "✓ Docker is ready!" -ForegroundColor Green
        break
    }
    catch {
        $retryCount++
        Write-Host "⏳ Waiting for Docker daemon... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
}

if ($retryCount -eq $maxRetries) {
    Write-Host "✗ Docker daemon did not start. Please ensure Docker Desktop is running." -ForegroundColor Red
    Write-Host ""
    Write-Host "To start Docker Desktop manually:" -ForegroundColor Yellow
    Write-Host "  1. Open Windows Start Menu" -ForegroundColor Gray
    Write-Host "  2. Search for 'Docker Desktop'" -ForegroundColor Gray
    Write-Host "  3. Click to launch" -ForegroundColor Gray
    Write-Host "  4. Wait for it to start (you'll see a Docker icon in the taskbar)" -ForegroundColor Gray
    Write-Host "  5. Run this script again" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "Building Docker images..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Build Successful!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "This may take 30-60 seconds as MySQL initializes..." -ForegroundColor Gray
Write-Host ""

docker-compose up

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Project Stopped" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
