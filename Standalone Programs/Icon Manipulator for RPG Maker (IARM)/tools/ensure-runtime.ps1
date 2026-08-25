#Requires -Version 5.0
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$AppName = 'Icon Manipulator for RPG Maker - v1.0'
$MinNodeMajor = 18
$FallbackNodeVersion = 'v22.18.0'
$AppDir = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$RuntimeDir = Join-Path $AppDir 'runtime\node'
$ElectronExe = Join-Path $AppDir 'node_modules\electron\dist\electron.exe'

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Write-Step {
  param([string]$Message)
  Write-Host $Message
}

function Get-NodeMajorVersion {
  param([string]$NodeExe)
  if (-not $NodeExe -or -not (Test-Path -LiteralPath $NodeExe)) {
    return 0
  }
  try {
    $output = & $NodeExe -v 2>$null
    if ($output -match 'v?(\d+)') {
      return [int]$Matches[1]
    }
  } catch {
    return 0
  }
  return 0
}

function Get-WindowsNodeArch {
  $arch = $env:PROCESSOR_ARCHITECTURE
  if ($arch -eq 'ARM64') { return 'arm64' }
  if ($arch -eq 'x86') { return 'x86' }
  return 'x64'
}

function Find-SystemNode {
  $command = Get-Command node -ErrorAction SilentlyContinue
  if ($command -and $command.Source) {
    return $command.Source
  }
  return $null
}

function Get-LatestLtsNodeVersion {
  try {
    $index = Invoke-RestMethod -Uri 'https://nodejs.org/dist/index.json' -TimeoutSec 30
    $latestLts = @(
      $index | Where-Object { $_.lts -and $_.lts -ne $false }
    ) | Select-Object -First 1
    if ($latestLts -and $latestLts.version) {
      return [string]$latestLts.version
    }
  } catch {
    Write-Step "Could not read the Node.js version list. Using $FallbackNodeVersion."
  }
  return $FallbackNodeVersion
}

function Install-PortableNode {
  $arch = Get-WindowsNodeArch
  $version = Get-LatestLtsNodeVersion
  if ($version -notmatch '^v') {
    $version = "v$version"
  }

  $zipName = "node-$version-win-$arch.zip"
  $url = "https://nodejs.org/dist/$version/$zipName"
  $tempRoot = Join-Path $env:TEMP 'iarm-node-setup'
  $zipPath = Join-Path $tempRoot $zipName
  $extractDir = Join-Path $tempRoot 'extract'

  Write-Step "Downloading Node.js $version ($arch)..."
  New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
  if (Test-Path -LiteralPath $extractDir) {
    Remove-Item -LiteralPath $extractDir -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $extractDir | Out-Null

  Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing

  Write-Step 'Extracting Node.js...'
  & tar -xf $zipPath -C $extractDir
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to extract Node.js archive."
  }

  $inner = Get-ChildItem -LiteralPath $extractDir -Directory | Select-Object -First 1
  if (-not $inner) {
    throw 'The Node.js archive did not contain an expected folder.'
  }

  $runtimeParent = Split-Path -Parent $RuntimeDir
  New-Item -ItemType Directory -Force -Path $runtimeParent | Out-Null
  if (Test-Path -LiteralPath $RuntimeDir) {
    Remove-Item -LiteralPath $RuntimeDir -Recurse -Force
  }
  Move-Item -LiteralPath $inner.FullName -Destination $RuntimeDir

  $nodeExe = Join-Path $RuntimeDir 'node.exe'
  if (-not (Test-Path -LiteralPath $nodeExe)) {
    throw 'Node.js was extracted, but node.exe was not found.'
  }

  Write-Step "Portable Node.js ready: $(& $nodeExe -v)"
  return $nodeExe
}

function Resolve-NodeExe {
  $portable = Join-Path $RuntimeDir 'node.exe'
  $portableMajor = Get-NodeMajorVersion $portable
  if ($portableMajor -ge $MinNodeMajor) {
    Write-Step "Using portable Node.js $(& $portable -v)"
    return $portable
  }

  $systemNode = Find-SystemNode
  $systemMajor = Get-NodeMajorVersion $systemNode
  if ($systemMajor -ge $MinNodeMajor) {
    Write-Step "Using installed Node.js $(& $systemNode -v)"
    return $systemNode
  }

  if ($systemNode -and $systemMajor -gt 0) {
    Write-Step "Found Node.js $(& $systemNode -v), but this program needs 18+."
  } else {
    Write-Step 'Node.js 18+ was not found on this PC.'
  }

  return Install-PortableNode
}

function Add-NodeToPath {
  param([string]$NodeExe)
  $nodeDir = Split-Path -Parent $NodeExe
  if (-not $nodeDir) {
    return
  }
  $parts = @($env:PATH -split ';' | Where-Object { $_ -and ($_ -ne $nodeDir) })
  $env:PATH = (@($nodeDir) + $parts) -join ';'
}

function Get-NpmCli {
  param([string]$NodeExe)
  $nodeDir = Split-Path -Parent $NodeExe
  $candidates = @(
    (Join-Path $nodeDir 'node_modules\npm\bin\npm-cli.js'),
    (Join-Path $RuntimeDir 'node_modules\npm\bin\npm-cli.js')
  )
  foreach ($candidate in $candidates) {
    if (Test-Path -LiteralPath $candidate) {
      return $candidate
    }
  }

  $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
  if ($npmCmd -and $npmCmd.Source) {
    return $npmCmd.Source
  }

  throw 'npm was not found next to Node.js.'
}

function Install-AppDependencies {
  param([string]$NodeExe)

  if (Test-Path -LiteralPath $ElectronExe) {
    return
  }

  Write-Step 'Installing program files (first launch, please wait)...'
  Add-NodeToPath -NodeExe $NodeExe
  $npmCli = Get-NpmCli -NodeExe $NodeExe
  Push-Location -LiteralPath $AppDir
  try {
    # Ignore lifecycle scripts so Electron's "node install.js" postinstall
    # cannot fail on PCs that do not have Node.js on the system PATH.
    # The Electron binary is downloaded next with the portable node.exe.
    $npmArgs = @('install', '--no-fund', '--no-audit', '--ignore-scripts')
    if ($npmCli.ToLowerInvariant().EndsWith('.js')) {
      & $NodeExe $npmCli @npmArgs
    } else {
      & $npmCli @npmArgs
    }
    if ($LASTEXITCODE -ne 0) {
      throw "npm install failed with exit code $LASTEXITCODE."
    }
  } finally {
    Pop-Location
  }
}

function Ensure-ElectronBinary {
  param([string]$NodeExe)

  if (Test-Path -LiteralPath $ElectronExe) {
    return
  }

  $installJs = Join-Path $AppDir 'node_modules\electron\install.js'
  if (Test-Path -LiteralPath $installJs) {
    Write-Step 'Downloading Electron runtime...'
    Add-NodeToPath -NodeExe $NodeExe
    try {
      & $NodeExe $installJs
      if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
        Write-Step 'Electron install.js returned an error. Trying a direct extract...'
      }
    } catch {
      Write-Step 'Electron install.js did not finish. Trying a direct extract...'
    }
  }

  if (Test-Path -LiteralPath $ElectronExe) {
    return
  }

  $cacheRoot = Join-Path $env:LOCALAPPDATA 'electron\Cache'
  $zip = $null
  if (Test-Path -LiteralPath $cacheRoot) {
    $zip = Get-ChildItem -LiteralPath $cacheRoot -Recurse -Filter 'electron-v*-win32-*.zip' -ErrorAction SilentlyContinue |
      Sort-Object LastWriteTime -Descending |
      Select-Object -First 1
  }

  if (-not $zip) {
    throw 'Electron was installed as a package, but electron.exe is missing. Check your internet connection and try again.'
  }

  $dist = Join-Path $AppDir 'node_modules\electron\dist'
  Write-Step 'Extracting Electron with tar...'
  New-Item -ItemType Directory -Force -Path $dist | Out-Null
  & tar -xf $zip.FullName -C $dist
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $ElectronExe)) {
    throw 'Failed to extract Electron.'
  }

  Set-Content -LiteralPath (Join-Path $AppDir 'node_modules\electron\path.txt') -Value 'electron.exe' -NoNewline
}

function Start-App {
  if (-not (Test-Path -LiteralPath $ElectronExe)) {
    throw "Electron executable was not found at $ElectronExe"
  }

  Write-Step "Starting $AppName ..."
  $process = Start-Process -FilePath $ElectronExe -ArgumentList '.' -WorkingDirectory $AppDir -Wait -PassThru
  if ($null -eq $process) {
    throw 'Failed to start the program window.'
  }
  exit $process.ExitCode
}

try {
  Write-Step $AppName
  $nodeExe = Resolve-NodeExe
  Add-NodeToPath -NodeExe $nodeExe
  Install-AppDependencies -NodeExe $nodeExe
  Ensure-ElectronBinary -NodeExe $nodeExe
  Start-App
} catch {
  Write-Host ''
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}
