$ErrorActionPreference = "Stop"

$downloadDir = Join-Path $env:TEMP "economia-pronto-installers"
New-Item -ItemType Directory -Path $downloadDir -Force | Out-Null

$nodeUrl = "https://nodejs.org/dist/v24.18.0/node-v24.18.0-x64.msi"
$gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.55.0.windows.2/Git-2.55.0.2-64-bit.exe"
$postgresUrl = "https://get.enterprisedb.com/postgresql/postgresql-18.4-1-windows-x64.exe"

$nodeInstaller = Join-Path $downloadDir "node-v24.18.0-x64.msi"
$gitInstaller = Join-Path $downloadDir "Git-2.55.0.2-64-bit.exe"
$postgresInstaller = Join-Path $downloadDir "postgresql-18.4-1-windows-x64.exe"

function Download-IfMissing {
  param(
    [string]$Url,
    [string]$OutFile
  )

  if (Test-Path $OutFile) {
    Write-Host "Arquivo ja baixado: $OutFile"
    return
  }

  Write-Host "Baixando: $Url"
  Invoke-WebRequest -Uri $Url -OutFile $OutFile
}

function Command-Exists {
  param([string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

if (-not (Command-Exists "node")) {
  Download-IfMissing -Url $nodeUrl -OutFile $nodeInstaller
  Write-Host "Instalando Node.js LTS..."
  Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /qn /norestart" -Wait
} else {
  Write-Host "Node.js ja esta instalado."
}

if (-not (Command-Exists "git")) {
  Download-IfMissing -Url $gitUrl -OutFile $gitInstaller
  Write-Host "Instalando Git for Windows..."
  Start-Process $gitInstaller -ArgumentList "/VERYSILENT /NORESTART /NOCANCEL /SP-" -Wait
} else {
  Write-Host "Git ja esta instalado."
}

if (-not (Command-Exists "psql")) {
  Download-IfMissing -Url $postgresUrl -OutFile $postgresInstaller
  Write-Host "Instalando PostgreSQL..."
  Start-Process $postgresInstaller -ArgumentList "--mode unattended --unattendedmodeui none --superpassword postgres --servicename postgresql-x64-18 --serverport 5432" -Wait
} else {
  Write-Host "PostgreSQL/psql ja esta instalado."
}

$postgresService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($postgresService -and $postgresService.Status -ne "Running") {
  Write-Host "Iniciando servico PostgreSQL..."
  Start-Service -Name $postgresService.Name
}

Write-Host "Instalacoes concluidas. Feche e reabra o terminal para atualizar o PATH."
