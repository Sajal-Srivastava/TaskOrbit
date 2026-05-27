$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root 'backend'
$frontendPath = Join-Path $root 'frontend'

Write-Host 'Starting TaskOrbit backend and frontend for demo recording...'

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm run dev"

Start-Sleep -Seconds 4
Start-Process 'http://localhost:5173'

Write-Host 'TaskOrbit demo environment launch initiated.'
Write-Host 'Backend and frontend are running in separate terminals.'
