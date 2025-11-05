# Orchestrate backend + frontend and run Playwright E2E on Windows PowerShell
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\run-e2e.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Wait-HttpOk {
    param(
        [Parameter(Mandatory=$true)][string]$Url,
        [int]$TimeoutSec = 60,
        [int]$DelayMs = 500
    )
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
        try {
            $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) { return $true }
        } catch {
            Start-Sleep -Milliseconds $DelayMs
        }
    }
    return $false
}

$script:Jobs = @()

try {
    $root = Split-Path $PSScriptRoot -Parent

    Write-Host "Starting backend (uvicorn) ..."
    $backendJob = Start-Job -Name 'moringa-backend' -ScriptBlock {
        param($projRoot)
        Set-Location (Join-Path $projRoot 'backend')
        $py = Join-Path $projRoot 'backend\venv\Scripts\python.exe'
        if (Test-Path $py) {
            & $py -m uvicorn app.main:app --host 0.0.0.0 --port 8000
        } else {
            & python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
        }
    } -ArgumentList $root
    $script:Jobs += $backendJob

    if (!(Wait-HttpOk -Url 'http://localhost:8000/docs' -TimeoutSec 60)) {
        throw 'Backend did not become ready on http://localhost:8000 within timeout.'
    }
    Write-Host 'Backend is ready.'

    Write-Host "Starting frontend (Next.js dev on :3002) ..."
    $frontendJob = Start-Job -Name 'moringa-frontend' -ScriptBlock {
        param($projRoot)
        Set-Location (Join-Path $projRoot 'moringa')
        & npm run dev -- -p 3002
    } -ArgumentList $root
    $script:Jobs += $frontendJob

    if (!(Wait-HttpOk -Url 'http://localhost:3002' -TimeoutSec 60)) {
        throw 'Frontend did not become ready on http://localhost:3002 within timeout.'
    }
    Write-Host 'Frontend is ready.'

    Write-Host 'Running Playwright tests ...'
    Set-Location (Join-Path $root 'moringa')
    & npx playwright install chromium
    & npm run test:e2e
}
finally {
    Write-Host 'Stopping jobs ...'
    foreach ($j in $script:Jobs) {
        try { Stop-Job -Job $j -Force -ErrorAction SilentlyContinue } catch {}
        try { Receive-Job -Job $j -Keep -ErrorAction SilentlyContinue | Out-Host } catch {}
        try { Remove-Job -Job $j -Force -ErrorAction SilentlyContinue } catch {}
    }
    Write-Host 'Done.'
}
