/**
 * Beendet einen laufenden Next-Dev-Server auf dem konfigurierten Port.
 * Verhindert unstyled Intro/App nach `dev:clean`, wenn `.next` gelöscht wird,
 * während noch ein alter `next dev`-Prozess auf dem Port lauscht.
 */
import { execSync } from 'node:child_process';

const port = Number(process.env.DEV_PORT || process.env.PORT || 3002);

function killPortWin(p) {
  try {
    const ps = [
      '$conns = Get-NetTCPConnection -LocalPort',
      String(p),
      '-State Listen -ErrorAction SilentlyContinue;',
      'if ($conns) {',
      '$conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {',
      'if ($_ -and $_ -ne 0) { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue; Write-Host ("stopped dev listener on :' +
        p +
        ' (pid " + $_ + ")") }',
      '}',
      '}',
    ].join(' ');
    execSync(`powershell -NoProfile -Command "${ps}"`, { stdio: 'inherit' });
  } catch {
    /* no listener */
  }
}

function killPortUnix(p) {
  try {
    execSync(`lsof -ti tcp:${p} | xargs -r kill -9`, {
      shell: '/bin/sh',
      stdio: 'ignore',
    });
    console.log(`stopped dev listener on :${p}`);
  } catch {
    /* no listener */
  }
}

if (process.platform === 'win32') killPortWin(port);
else killPortUnix(port);
