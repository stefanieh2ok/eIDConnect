# eIDConnect – Code zu GitHub pushen
# Einmal in Cursor-Terminal ausführen: .\push-to-github.ps1

Set-Location $PSScriptRoot

if (-not (Test-Path .git)) {
    Write-Host "Git wird initialisiert..."
    git init
}

Write-Host "Dateien werden hinzugefügt..."
git add .
Write-Host "Commit wird erstellt..."
git commit -m "Initial commit: eIDConnect" 2>$null
if ($LASTEXITCODE -ne 0) { git commit -m "Update eIDConnect" }

$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "Remote wird verknüpft..."
    git remote add origin https://github.com/stefanieh2ok/eIDConnect.git
} else {
    git remote set-url origin https://github.com/stefanieh2ok/eIDConnect.git
}

git branch -M main
Write-Host ""
Write-Host "Jetzt wird zu GitHub gepusht. Du wirst nach Benutzername und Passwort gefragt."
Write-Host "Passwort = dein Personal Access Token (nicht dein GitHub-Passwort!)"
Write-Host "Token erstellen: https://github.com/settings/tokens"
Write-Host ""
git push -u origin main
