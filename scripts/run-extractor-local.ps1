param(
  [int]$HostPort = 8080
)

# Navigate to repo root (scripts folder is inside repo)
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "Building extractor Docker image..."
docker build -f extractor/Dockerfile -t destination-extractor:local .

# If port is in use, attempt to stop the owning process (best-effort)
$net = Get-NetTCPConnection -LocalPort $HostPort -ErrorAction SilentlyContinue
if ($net) {
  $pid = $net.OwningProcess
  Write-Host "Port $HostPort appears in use by PID $pid. Attempting to stop process..."
  try {
    Stop-Process -Id $pid -Force -ErrorAction Stop
    Write-Host "Stopped process $pid"
  } catch {
    Write-Host "Could not stop PID $pid: $_"
    Write-Host "You can run the container on another host port, e.g. -HostPort 8081"
  }
}

Write-Host "Running container (host port $HostPort -> container 8080)..."
docker run --rm -p ${HostPort}:8080 destination-extractor:local
