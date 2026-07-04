$ErrorActionPreference = "Stop"

$nodeVersion = "v24.18.0"
$toolsDir = Join-Path (Get-Location) "tools"
$nodeZip = Join-Path $toolsDir "node-$nodeVersion-win-x64.zip"
$nodeDir = Join-Path $toolsDir "node-$nodeVersion-win-x64"
$nodeUrl = "https://nodejs.org/dist/$nodeVersion/node-$nodeVersion-win-x64.zip"

New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null

if (-not (Test-Path $nodeZip)) {
  Write-Host "Baixando Node.js portable: $nodeUrl"
  Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip
}

if (-not (Test-Path $nodeDir)) {
  Write-Host "Extraindo Node.js portable..."
  Expand-Archive -Path $nodeZip -DestinationPath $toolsDir -Force
}

Write-Host "Node portable pronto:"
& (Join-Path $nodeDir "node.exe") --version
& (Join-Path $nodeDir "npm.cmd") --version
