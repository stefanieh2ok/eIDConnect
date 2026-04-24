#Requires -RunAsAdministrator
$log = Join-Path $PSScriptRoot 'last-choco-removal.log'
$target = "$env:ProgramData\chocolatey"
$empty = "$env:TEMP\empty_dir_choco_delete_$(Get-Random)"
function W($m) { $m | Tee-Object -FilePath $log -Append; Write-Host $m }
'' | Out-File $log -Force
W "$(Get-Date -Format o) Robocopy-Methode"

Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -and $_.Path -like '*chocolatey*' } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

if (-not (Test-Path $target)) {
  W "Bereits weg: $target"
  exit 0
}

New-Item -ItemType Directory -Path $empty -Force | Out-Null
W "robocopy leert $target ..."
& robocopy.exe $empty $target /MIR /R:0 /W:0 /NFL /NDL /NJH /NJS | Out-Null
Remove-Item $empty -Force -ErrorAction SilentlyContinue
W "robocopy Exit: $LASTEXITCODE"

try {
  Remove-Item -LiteralPath $target -Force -ErrorAction Stop
  W "Ordner entfernt."
} catch {
  W "Remove-Item: $($_.Exception.Message)"
}

foreach ($k in @('ChocolateyInstall', 'ChocolateyToolsLocation', 'ChocolateyLastPathUpdate')) {
  [Environment]::SetEnvironmentVariable($k, $null, 'Machine')
  [Environment]::SetEnvironmentVariable($k, $null, 'User')
}
foreach ($scope in @('Machine', 'User')) {
  $p = [Environment]::GetEnvironmentVariable('Path', $scope)
  if ([string]::IsNullOrWhiteSpace($p)) { continue }
  $n = ($p -split ';' | Where-Object { $_ -and ($_ -notmatch 'chocolatey') }) -join ';'
  [Environment]::SetEnvironmentVariable('Path', $n, $scope)
}
W "Test-Path: $(Test-Path $target)"
W "Falls der leere Ordner bleibt: Neustart, dann als Admin: rd /s /q `"$target`""
