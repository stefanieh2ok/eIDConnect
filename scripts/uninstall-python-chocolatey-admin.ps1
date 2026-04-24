#Requires -RunAsAdministrator
<#
  Entfernt Python 3.13 (Chocolatey + typische MSI-/Benutzerpfade) und die Chocolatey-Installation.
  Nur mit Rechtsklick "Mit Windows PowerShell ausführen" > Als Administrator starten,
  oder: Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File Pfad\zu\dieser\Datei'
#>
$ErrorActionPreference = 'Continue'

function Remove-PathSegment {
  param([ValidateSet('Machine', 'User')][string]$Scope, [string]$Substring)
  $p = [Environment]::GetEnvironmentVariable('Path', $Scope)
  if ([string]::IsNullOrWhiteSpace($p)) { return }
  $parts = $p -split ';' | Where-Object { $_ -and ($_ -notlike "*$Substring*") }
  [Environment]::SetEnvironmentVariable('Path', ($parts -join ';'), $Scope)
}

Write-Host '=== 1) Chocolatey: Python-Pakete deinstallieren ===' -ForegroundColor Cyan
if (Test-Path "$env:ProgramData\chocolatey\choco.exe") {
  & "$env:ProgramData\chocolatey\choco.exe" uninstall python313 python3 python -y --force 2>&1 | Out-Host
}

Write-Host '=== 2) MSI: Einträge „Python 3.13“ still deinstallieren ===' -ForegroundColor Cyan
$keys = @(
  'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
  'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
  'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*'
)
foreach ($pat in $keys) {
  Get-ItemProperty $pat -ErrorAction SilentlyContinue |
    Where-Object {
      $_.DisplayName -match 'Python 3\.13' -and $_.UninstallString
    } |
    ForEach-Object {
      $us = $_.UninstallString
      if ($us -match 'MsiExec\.exe\s*/I\{([^}]+)\}' -or $us -match '\{([0-9A-Fa-f\-]{36})\}') {
        $guid = $Matches[1]
        Write-Host "msiexec /x {$guid} ( $($_.DisplayName) )"
        $p = Start-Process -FilePath msiexec.exe -ArgumentList @('/x', "{$guid}", '/qn', '/norestart') -Wait -PassThru -NoNewWindow
        Write-Host "ExitCode: $($p.ExitCode)"
      }
    }
}

Write-Host '=== 3) Installationsordner (Benutzer) entfernen ===' -ForegroundColor Cyan
$pyDirs = @(
  "$env:LOCALAPPDATA\Programs\Python",
  "$env:LOCALAPPDATA\Package Cache\{2a612b01-6a34-408a-b31b-2fa0f048823f}"
)
foreach ($d in $pyDirs) {
  if (Test-Path $d) {
    Remove-Item -LiteralPath $d -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Entfernt (falls vorhanden): $d"
  }
}

Write-Host '=== 4) Chocolatey-Ordner und Umgebungsvariablen ===' -ForegroundColor Cyan
$chocoRoot = $env:ChocolateyInstall
if ([string]::IsNullOrWhiteSpace($chocoRoot)) { $chocoRoot = "$env:ProgramData\chocolatey" }
if (Test-Path $chocoRoot) {
  Remove-Item -LiteralPath $chocoRoot -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "Entfernt: $chocoRoot"
}

[Environment]::SetEnvironmentVariable('ChocolateyInstall', $null, 'Machine')
[Environment]::SetEnvironmentVariable('ChocolateyInstall', $null, 'User')
[Environment]::SetEnvironmentVariable('ChocolateyToolsLocation', $null, 'Machine')
[Environment]::SetEnvironmentVariable('ChocolateyToolsLocation', $null, 'User')
[Environment]::SetEnvironmentVariable('ChocolateyLastPathUpdate', $null, 'Machine')
[Environment]::SetEnvironmentVariable('ChocolateyLastPathUpdate', $null, 'User')

Remove-PathSegment -Scope 'Machine' -Substring 'chocolatey'
Remove-PathSegment -Scope 'User' -Substring 'chocolatey'

Write-Host ''
Write-Host 'Fertig. Neues Terminal öffnen. Prüfen mit: where.exe choco   where.exe python' -ForegroundColor Green
Write-Host 'Hinweis: Visual Studio Build Tools / dotnetfx wurden NICHT entfernt (nur Chocolatey-Client + Python-Ziel).' -ForegroundColor Yellow
