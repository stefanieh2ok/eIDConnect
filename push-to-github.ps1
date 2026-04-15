# eIDConnect – Code zu GitHub pushen
# Remote-URL bei Bedarf anpassen (Repository-Name auf GitHub).

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path .git)) {
    git init
    git add .
    git commit -m "Initial commit: eIDConnect" 2>$null
    if ($LASTEXITCODE -ne 0) { git commit -m "Update eIDConnect" }
    Write-Host "Neues Git-Repository initialisiert."
}

$hasRemote = git remote 2>$null | Select-String -Pattern "origin"
if (-not $hasRemote) {
    git remote add origin https://github.com/stefanieh2ok/eIDConnect.git
} else {
    git remote set-url origin https://github.com/stefanieh2ok/eIDConnect.git
}

git branch -M main 2>$null
git push -u origin main
Write-Host "Fertig."
