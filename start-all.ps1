param(
    [switch]$OpenCheckout,
    [switch]$InstallDeps
)

$ErrorActionPreference = 'Stop'

function Start-ProcessInDir {
    param(
        [string]$Name,
        [string]$WorkingDirectory,
        [string]$Command
    )

    Start-Process powershell -ArgumentList @(
        '-NoExit',
        '-ExecutionPolicy', 'Bypass',
        '-Command', "Set-Location '$WorkingDirectory'; $Command"
    )
}

if ($InstallDeps) {
    Write-Host 'Installing dependencies...'
    npm install
    npm install --workspace=client
    npm install --workspace=server
}

Write-Host 'Starting backend and frontend...'
Start-ProcessInDir -Name 'server' -WorkingDirectory (Join-Path $PSScriptRoot 'server') -Command 'npm start'
Start-ProcessInDir -Name 'client' -WorkingDirectory (Join-Path $PSScriptRoot 'client') -Command 'npm run dev'

if ($OpenCheckout) {
    Start-Sleep -Seconds 2
    Start-Process 'http://localhost:5173/checkout'
}

Write-Host 'Launched.'