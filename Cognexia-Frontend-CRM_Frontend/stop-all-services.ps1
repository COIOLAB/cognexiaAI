# CognexiaAI - Stop All Services
# This script stops all running Node.js processes (backend and frontend services)

Write-Host "========================================" -ForegroundColor Red
Write-Host "  CognexiaAI - Stopping All Services" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Get all Node.js processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es) running..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($process in $nodeProcesses) {
        Write-Host "Stopping process ID: $($process.Id)" -ForegroundColor Gray
        Stop-Process -Id $process.Id -Force
    }
    
    Write-Host ""
    Write-Host "All Node.js services stopped!" -ForegroundColor Green
} else {
    Write-Host "No Node.js services are currently running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
