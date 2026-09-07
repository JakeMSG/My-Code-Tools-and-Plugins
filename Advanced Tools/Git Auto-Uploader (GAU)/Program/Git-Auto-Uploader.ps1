# Git Auto-Uploader (GAU) - Windows PowerShell 5.1+
$ErrorActionPreference = 'Continue'
try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

$Host.UI.RawUI.WindowTitle = 'Git Auto-Uploader'

$script:MaxPushBytes = [int64]1932735283  # 1.8 GiB
$script:GitHubFileLimitBytes = [int64]104857600  # 100 MiB
$script:GitExe = $null
$script:GhExe = $null
$script:Repo = $null
$script:WorkFolder = $null
$script:SubPath = ''
$script:ToolDir = $null
$script:ConfigPath = $null
$script:Config = $null
$script:HiddenGitName = '.gau-repo'

$script:ToolFileNames = @(
    'Git-Auto-Uploader.bat',
    'Git-Auto-Uploader.ps1',
    'HowToUse.txt',
    'gau-config.json'
)

$script:ExcludeBegin = '# BEGIN Git-Auto-Uploader ignore'
$script:ExcludeEnd = '# END Git-Auto-Uploader ignore'

function Update-SessionPath {
    $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $user = [Environment]::GetEnvironmentVariable('Path', 'User')
    $parts = @()
    if ($machine) { $parts += $machine }
    if ($user) { $parts += $user }
    if ($parts.Count -gt 0) { $env:Path = ($parts -join ';') }
}

function Convert-GitOutput {
    param($Output)
    $text = @()
    foreach ($item in @($Output)) {
        if ($null -eq $item) { continue }
        if ($item -is [System.Management.Automation.ErrorRecord]) {
            $text += [string]$item.Exception.Message
        } else {
            $text += [string]$item
        }
    }
    return $text
}

function Add-FlatGitArgs {
    param(
        $List,
        [object[]]$Items
    )
    foreach ($item in @($Items)) {
        if ($null -eq $item) { continue }
        if (($item -is [System.Array]) -and -not ($item -is [string])) {
            Add-FlatGitArgs -List $List -Items @($item)
        } else {
            [void]$List.Add([string]$item)
        }
    }
}

function Invoke-GitRaw {
    param(
        [switch]$AllowFail,
        [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
        [object[]]$GitArgs
    )
    $flat = New-Object System.Collections.Generic.List[string]
    Add-FlatGitArgs -List $flat -Items $GitArgs
    $gitArgArray = $flat.ToArray()
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $output = & $script:GitExe @gitArgArray 2>&1
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prevEap
    $text = Convert-GitOutput $output
    if (-not $AllowFail -and $code -ne 0) {
        throw ("git {0}`n{1}" -f ($gitArgArray -join ' '), ($text -join "`n"))
    }
    return @{ Code = $code; Lines = $text }
}

function Invoke-Git {
    param(
        [switch]$AllowFail,
        [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
        [object[]]$GitArgs
    )
    $all = New-Object System.Collections.Generic.List[string]
    if (-not [string]::IsNullOrWhiteSpace($script:Repo)) {
        [void]$all.Add('-C')
        [void]$all.Add($script:Repo)
    }
    Add-FlatGitArgs -List $all -Items $GitArgs
    $splat = $all.ToArray()
    if ($AllowFail) {
        return Invoke-GitRaw -AllowFail @splat
    }
    return Invoke-GitRaw @splat
}

function Convert-StatusCode {
    param([string]$Code)
    if ([string]::IsNullOrEmpty($Code)) { return 'Changed' }
    $kind = $Code.Substring(0, 1)
    switch ($kind) {
        'A' { return 'Added' }
        'D' { return 'Removed' }
        'M' { return 'Modified' }
        'R' { return 'Renamed' }
        'C' { return 'Copied' }
        'T' { return 'Type changed' }
        '?' { return 'Added' }
        default { return $Code }
    }
}

function Get-StatusColor {
    param([string]$Label)
    switch ($Label) {
        'Added' { return 'Green' }
        'Removed' { return 'Red' }
        'Modified' { return 'White' }
        'Renamed' { return 'Cyan' }
        default { return 'Gray' }
    }
}

function Write-LabelValue {
    param([string]$Label, [string]$Value, [string]$Color = 'White')
    Write-Host ('  {0,-11}' -f ($Label + ':')) -NoNewline -ForegroundColor DarkGray
    Write-Host $Value -ForegroundColor $Color
}

function Write-Rule {
    Write-Host (' ' + ('=' * 62)) -ForegroundColor DarkGray
}

function Write-GitLines {
    param([object[]]$Lines)
    foreach ($line in @($Lines)) {
        if (-not [string]::IsNullOrWhiteSpace($line)) {
            Write-Host ("    $line") -ForegroundColor Gray
        }
    }
}

function Get-IntCount {
    param([string]$Text)
    $n = 0
    [void][int]::TryParse(($Text -replace '\s', ''), [ref]$n)
    return $n
}

function Confirm-Yes {
    param([string]$Prompt)
    $ans = Read-Host $Prompt
    return ($ans -match '^[Yy]([Ee][Ss])?$')
}

function Get-NameStatusEntries {
    param([object[]]$RawLines)
    $seen = New-Object 'System.Collections.Generic.HashSet[string]'
    $unique = New-Object System.Collections.Generic.List[string]
    foreach ($fileLine in @($RawLines)) {
        if ($fileLine -cnotmatch '^[ACDMRTU?!][0-9]*\t') { continue }
        if ($seen.Add($fileLine)) { [void]$unique.Add($fileLine) }
    }
    return $unique
}

function Format-Bytes {
    param([int64]$Bytes)
    if ($Bytes -ge 1073741824) { return ('{0:N2} GiB' -f ($Bytes / 1073741824.0)) }
    if ($Bytes -ge 1048576) { return ('{0:N1} MiB' -f ($Bytes / 1048576.0)) }
    if ($Bytes -ge 1024) { return ('{0:N0} KiB' -f ($Bytes / 1024.0)) }
    return "$Bytes B"
}

function Test-IsToolFileName {
    param([string]$Name)
    foreach ($toolName in $script:ToolFileNames) {
        if ([string]::Equals($Name, $toolName, [StringComparison]::OrdinalIgnoreCase)) { return $true }
    }
    return $false
}

function Resolve-GitExe {
    Update-SessionPath
    $cmd = Get-Command git.exe -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source -and [System.IO.File]::Exists($cmd.Source)) { return $cmd.Source }
    $candidates = @(
        (Join-Path $env:ProgramFiles 'Git\cmd\git.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Git\cmd\git.exe'),
        (Join-Path $env:LOCALAPPDATA 'Programs\Git\cmd\git.exe'),
        'D:\Programs\Git\cmd\git.exe'
    )
    foreach ($path in $candidates) {
        if ($path -and [System.IO.File]::Exists($path)) { return $path }
    }
    return $null
}

function Resolve-GhExe {
    Update-SessionPath
    $cmd = Get-Command gh.exe -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source -and [System.IO.File]::Exists($cmd.Source)) { return $cmd.Source }
    $candidates = @(
        (Join-Path $env:ProgramFiles 'GitHub CLI\gh.exe'),
        'D:\Programs\gh\bin\gh.exe'
    )
    foreach ($path in $candidates) {
        if ($path -and [System.IO.File]::Exists($path)) { return $path }
    }
    return $null
}

function Invoke-SilentProcess {
    param([string]$FilePath, [string[]]$Arguments)
    $p = Start-Process -FilePath $FilePath -ArgumentList $Arguments -Wait -PassThru -NoNewWindow
    return $p.ExitCode
}

function Install-GitForWindows {
    Write-Host '  Git was not found. Installing Git for Windows...' -ForegroundColor Cyan
    $winget = Get-Command winget.exe -ErrorAction SilentlyContinue
    if ($winget) {
        Write-Host '  Trying winget (Git.Git)...' -ForegroundColor DarkGray
        $code = Invoke-SilentProcess -FilePath $winget.Source -Arguments @(
            'install', '--id', 'Git.Git', '-e', '--source', 'winget',
            '--accept-package-agreements', '--accept-source-agreements', '--disable-interactivity'
        )
        Update-SessionPath
        $found = Resolve-GitExe
        if ($found) { return $found }
        Write-Host ("  winget finished with code {0}; trying a direct download." -f $code) -ForegroundColor Yellow
    }

    $installer = Join-Path $env:TEMP 'GAU-Git-64-bit.exe'
    $url = $null
    try {
        Write-Host '  Looking up the latest Git for Windows release...' -ForegroundColor DarkGray
        $rel = Invoke-RestMethod -Uri 'https://api.github.com/repos/git-for-windows/git/releases/latest' -UseBasicParsing
        foreach ($asset in $rel.assets) {
            if ($asset.name -match '^Git-.*-64-bit\.exe$') {
                $url = $asset.browser_download_url
                break
            }
        }
    } catch {
        Write-Host ('  Release lookup failed: ' + $_.Exception.Message) -ForegroundColor Yellow
    }
    if (-not $url) {
        $url = 'https://github.com/git-for-windows/git/releases/latest/download/Git-64-bit.exe'
    }

    Write-Host '  Downloading Git installer...' -ForegroundColor DarkGray
    curl.exe -L --fail -o $installer $url
    if ($LASTEXITCODE -ne 0 -or -not [System.IO.File]::Exists($installer)) {
        throw 'Could not download Git for Windows. Install Git from https://git-scm.com/download/win and run this tool again.'
    }

    Write-Host '  Running the silent Git installer (may take a minute)...' -ForegroundColor DarkGray
    $code = Invoke-SilentProcess -FilePath $installer -Arguments @(
        '/VERYSILENT', '/NORESTART', '/SUPPRESSMSGBOXES', '/NOCANCEL',
        '/COMPONENTS=icons,ext\reg\shellhere,assoc,assoc_sh,gitlfs'
    )
    Update-SessionPath
    $found = Resolve-GitExe
    if ($found) { return $found }
    throw ("Git installer finished (code {0}) but git.exe was still not found. Restart the PC and try again." -f $code)
}

function Enable-GitLongPaths {
    [void](Invoke-GitRaw -AllowFail 'config' '--global' 'core.longpaths' 'true')
    if (-not [string]::IsNullOrWhiteSpace($script:Repo) -and (Test-HasGitDir $script:Repo)) {
        [void](Invoke-Git -AllowFail 'config' 'core.longpaths' 'true')
    }
}

function Test-HasGitDir {
    param([string]$Folder)
    if ([string]::IsNullOrWhiteSpace($Folder)) { return $false }
    $git = Join-Path $Folder '.git'
    return ([System.IO.Directory]::Exists($git) -or [System.IO.File]::Exists($git))
}

function Ensure-Git {
    $script:GitExe = Resolve-GitExe
    if (-not $script:GitExe) {
        $script:GitExe = Install-GitForWindows
    }
    $script:GhExe = Resolve-GhExe
    $ver = Invoke-GitRaw -AllowFail 'version'
    Write-Host ('  Using ' + (($ver.Lines | Select-Object -First 1))) -ForegroundColor DarkGray
    Enable-GitLongPaths
}

function ConvertFrom-GitHubUrl {
    param([string]$Raw)
    if ([string]::IsNullOrWhiteSpace($Raw)) { return $null }
    $url = $Raw.Trim().Trim('"').Trim("'").TrimEnd('/')
    $owner = $null
    $name = $null
    $kind = ''
    $after = ''
    if ($url -match 'github\.com[/:](?<owner>[^/]+)/(?<repo>[^/\#\?]+)(?:/(?<kind>tree|blob|raw)/(?<rest>.+))?') {
        $owner = $Matches['owner']
        $name = $Matches['repo']
        if ($Matches['kind']) { $kind = $Matches['kind'] }
        if ($Matches['rest']) { $after = $Matches['rest'] }
    } elseif ($url -match '^(?<owner>[^/]+)/(?<repo>[^/\#\?]+)$') {
        $owner = $Matches['owner']
        $name = $Matches['repo']
    } else {
        return $null
    }
    $name = $name -replace '\.git$', ''
    $name = $name.TrimEnd('/')
    if ([string]::IsNullOrWhiteSpace($owner) -or [string]::IsNullOrWhiteSpace($name)) { return $null }
    if ($name -match '^(tree|blob|raw|commit|issues|pull|releases|actions|wiki|settings)$') { return $null }

    $branch = ''
    $subPath = ''
    if ($after) {
        $after = $after.Split('#')[0].Split('?')[0]
        $parts = @($after.Split('/') | Where-Object { $_ -ne '' })
        $decoded = New-Object System.Collections.Generic.List[string]
        foreach ($part in $parts) {
            try { [void]$decoded.Add([Uri]::UnescapeDataString($part)) }
            catch { [void]$decoded.Add($part) }
        }
        if ($decoded.Count -ge 1) {
            $branch = $decoded[0]
            if ($decoded.Count -ge 2) {
                $pathParts = New-Object System.Collections.Generic.List[string]
                for ($i = 1; $i -lt $decoded.Count; $i++) { [void]$pathParts.Add($decoded[$i]) }
                if ($kind -eq 'blob' -and $pathParts.Count -ge 1) {
                    $last = $pathParts[$pathParts.Count - 1]
                    if ($last -match '\.') { $pathParts.RemoveAt($pathParts.Count - 1) }
                }
                $subPath = ($pathParts -join '/')
            }
        }
    }

    $webUrl = ('https://github.com/{0}/{1}' -f $owner, $name)
    if ($subPath) {
        $b = $branch
        if ([string]::IsNullOrWhiteSpace($b)) { $b = 'main' }
        $webUrl = ('https://github.com/{0}/{1}/tree/{2}/{3}' -f $owner, $name, $b, $subPath)
    }
    return @{
        Owner = $owner
        Name = $name
        GitUrl = ('https://github.com/{0}/{1}.git' -f $owner, $name)
        WebUrl = $webUrl
        Input = $url
        Branch = $branch
        SubPath = $subPath
    }
}

function Read-RepoLink {
    while ($true) {
        Write-Host ''
        Write-Host '  Paste a GitHub repo link (root, or any path inside the repo).' -ForegroundColor Cyan
        $raw = Read-Host '  Repo URL'
        $parsed = ConvertFrom-GitHubUrl $raw
        if ($parsed) {
            Write-Host ('  Repo:   {0}' -f ('https://github.com/{0}/{1}' -f $parsed.Owner, $parsed.Name)) -ForegroundColor Green
            if ($parsed.Branch) {
                Write-Host ('  Branch: {0}' -f $parsed.Branch) -ForegroundColor Green
            }
            if ($parsed.SubPath) {
                Write-Host ('  Path:   {0}' -f $parsed.SubPath) -ForegroundColor Green
                Write-Host '  Local files will map to that folder inside the repo (not the whole tree).' -ForegroundColor DarkGray
            } else {
                Write-Host '  Path:   (repository root)' -ForegroundColor Green
            }
            return $parsed
        }
        Write-Host '  Could not parse that. Example: https://github.com/Owner/Repo' -ForegroundColor Yellow
    }
}

function Read-FolderPath {
    Write-Host ''
    Write-Host '  Folder for the files (working copy).' -ForegroundColor Cyan
    Write-Host '  Enter = this tool folder, and GAU files will be ignored on Push.' -ForegroundColor DarkGray
    Write-Host '  Typed path = use that folder; GAU files are NOT ignored.' -ForegroundColor DarkGray
    $raw = Read-Host '  Folder path'
    if ([string]::IsNullOrWhiteSpace($raw)) {
        return @{ Path = $script:ToolDir; IgnoreToolFiles = $true }
    }
    $raw = $raw.Trim().Trim('"').Trim("'")
    $full = [System.IO.Path]::GetFullPath($raw)
    return @{ Path = $full; IgnoreToolFiles = $false }
}

function Get-NewConfigObject {
    return @{
        setupComplete = $false
        repoGitUrl = ''
        repoWebUrl = ''
        repoInput = ''
        repoBranch = ''
        repoSubPath = ''
        folderPath = ''
        ignoreToolFiles = $false
    }
}

function Save-ParsedRepoToConfig {
    param($Parsed)
    $script:Config.repoGitUrl = $Parsed.GitUrl
    $script:Config.repoWebUrl = $Parsed.WebUrl
    $script:Config.repoInput = $Parsed.Input
    $script:Config.repoBranch = [string]$Parsed.Branch
    $script:Config.repoSubPath = [string]$Parsed.SubPath
}

function Save-GauConfig {
    $obj = [ordered]@{
        setupComplete = [bool]$script:Config.setupComplete
        repoGitUrl = [string]$script:Config.repoGitUrl
        repoWebUrl = [string]$script:Config.repoWebUrl
        repoInput = [string]$script:Config.repoInput
        repoBranch = [string]$script:Config.repoBranch
        repoSubPath = [string]$script:Config.repoSubPath
        folderPath = [string]$script:Config.folderPath
        ignoreToolFiles = [bool]$script:Config.ignoreToolFiles
    }
    $json = $obj | ConvertTo-Json -Depth 5
    [System.IO.File]::WriteAllText($script:ConfigPath, $json, (New-Object System.Text.UTF8Encoding $false))
}

function Load-GauConfig {
    if (-not [System.IO.File]::Exists($script:ConfigPath)) {
        $script:Config = Get-NewConfigObject
        return
    }
    $raw = [System.IO.File]::ReadAllText($script:ConfigPath)
    $json = $raw | ConvertFrom-Json
    $script:Config = Get-NewConfigObject
    $script:Config.setupComplete = [bool]$json.setupComplete
    $script:Config.repoGitUrl = [string]$json.repoGitUrl
    $script:Config.repoWebUrl = [string]$json.repoWebUrl
    $script:Config.repoInput = [string]$json.repoInput
    if ($json.PSObject.Properties.Name -contains 'repoBranch') {
        $script:Config.repoBranch = [string]$json.repoBranch
    }
    if ($json.PSObject.Properties.Name -contains 'repoSubPath') {
        $script:Config.repoSubPath = [string]$json.repoSubPath
    }
    $script:Config.folderPath = [string]$json.folderPath
    $script:Config.ignoreToolFiles = [bool]$json.ignoreToolFiles
}

function Repair-ConfigRepoPath {
    if (-not [string]::IsNullOrWhiteSpace($script:Config.repoSubPath)) { return }
    foreach ($candidate in @($script:Config.repoInput, $script:Config.repoWebUrl)) {
        if ([string]::IsNullOrWhiteSpace($candidate)) { continue }
        $parsed = ConvertFrom-GitHubUrl $candidate
        if ($parsed -and -not [string]::IsNullOrWhiteSpace($parsed.SubPath)) {
            Save-ParsedRepoToConfig -Parsed $parsed
            Save-GauConfig
            Write-Host '  Saved GitHub link includes a folder path. Using that path (not the repo root).' -ForegroundColor Yellow
            Write-Host ('  Path: {0}' -f $parsed.SubPath) -ForegroundColor Yellow
            return
        }
    }
}

function Test-IsSubPathMode {
    return -not [string]::IsNullOrWhiteSpace($script:SubPath)
}

function Set-GitRuntimeFromConfig {
    $script:WorkFolder = $script:Config.folderPath
    $script:SubPath = ([string]$script:Config.repoSubPath).Replace('\', '/').Trim('/')
    if (Test-IsSubPathMode) {
        $script:Repo = Join-Path $script:WorkFolder $script:HiddenGitName
    } else {
        $script:Repo = $script:WorkFolder
    }
}

function Get-GitPathArgs {
    if (Test-IsSubPathMode) { return @('--', $script:SubPath) }
    return @()
}

function Convert-ToGitRelPath {
    param([string]$Path)
    return (($Path -replace '\\', '/').Trim('/'))
}

function Get-GitSubPathOnDisk {
    if (-not (Test-IsSubPathMode)) { return $script:Repo }
    $parts = @($script:SubPath.Split('/') | Where-Object { $_ -ne '' })
    $dir = $script:Repo
    foreach ($part in $parts) { $dir = Join-Path $dir $part }
    return $dir
}

function Test-ShouldSkipSyncPath {
    param([string]$Root, [string]$FullPath)
    $rootNorm = $Root.TrimEnd('\', '/')
    $fullNorm = $FullPath.TrimEnd('\', '/')
    if ([string]::Equals($fullNorm, $rootNorm, [StringComparison]::OrdinalIgnoreCase)) { return $false }
    if ($fullNorm.Length -le $rootNorm.Length) { return $true }
    $rel = $fullNorm.Substring($rootNorm.Length).TrimStart('\', '/')
    $rel = $rel -replace '/', '\'
    $parts = @($rel.Split('\') | Where-Object { $_ -ne '' })
    foreach ($part in $parts) {
        if ($part -eq $script:HiddenGitName -or $part -eq '.git') { return $true }
    }
    if ($parts.Count -eq 1) {
        if ($parts[0] -eq 'gau-config.json') { return $true }
        if ($script:Config.ignoreToolFiles -and (Test-IsToolFileName $parts[0])) { return $true }
    }
    return $false
}

function Copy-SyncTree {
    param(
        [string]$Source,
        [string]$Dest,
        [switch]$DeleteExtra
    )
    if (-not [System.IO.Directory]::Exists($Source)) {
        [void][System.IO.Directory]::CreateDirectory($Source)
    }
    if (-not [System.IO.Directory]::Exists($Dest)) {
        [void][System.IO.Directory]::CreateDirectory($Dest)
    }
    $srcRoot = [System.IO.Path]::GetFullPath($Source)
    $dstRoot = [System.IO.Path]::GetFullPath($Dest)
    $srcFiles = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)

    $stack = New-Object System.Collections.Generic.Stack[string]
    $stack.Push($srcRoot)
    while ($stack.Count -gt 0) {
        $dir = $stack.Pop()
        if (Test-ShouldSkipSyncPath -Root $srcRoot -FullPath $dir) { continue }
        foreach ($childDir in [System.IO.Directory]::GetDirectories($dir)) {
            $name = [System.IO.Path]::GetFileName($childDir)
            if ($name -eq $script:HiddenGitName -or $name -eq '.git') { continue }
            $stack.Push($childDir)
        }
        foreach ($file in [System.IO.Directory]::GetFiles($dir)) {
            if (Test-ShouldSkipSyncPath -Root $srcRoot -FullPath $file) { continue }
            $rel = $file.Substring($srcRoot.Length).TrimStart('\', '/')
            [void]$srcFiles.Add($rel)
            $target = Join-Path $dstRoot $rel
            $targetDir = [System.IO.Path]::GetDirectoryName($target)
            if (-not [System.IO.Directory]::Exists($targetDir)) {
                [void][System.IO.Directory]::CreateDirectory($targetDir)
            }
            [System.IO.File]::Copy($file, $target, $true)
        }
    }

    if ($DeleteExtra) {
        $dstack = New-Object System.Collections.Generic.Stack[string]
        $dstack.Push($dstRoot)
        $toDelete = New-Object System.Collections.Generic.List[string]
        while ($dstack.Count -gt 0) {
            $dir = $dstack.Pop()
            if (Test-ShouldSkipSyncPath -Root $dstRoot -FullPath $dir) { continue }
            foreach ($childDir in [System.IO.Directory]::GetDirectories($dir)) {
                $name = [System.IO.Path]::GetFileName($childDir)
                if ($name -eq $script:HiddenGitName -or $name -eq '.git') { continue }
                $dstack.Push($childDir)
            }
            foreach ($file in [System.IO.Directory]::GetFiles($dir)) {
                if (Test-ShouldSkipSyncPath -Root $dstRoot -FullPath $file) { continue }
                $rel = $file.Substring($dstRoot.Length).TrimStart('\', '/')
                if (-not $srcFiles.Contains($rel)) { [void]$toDelete.Add($file) }
            }
        }
        foreach ($file in $toDelete) {
            [System.IO.File]::Delete($file)
        }
    }
}

function Sync-WorkFolderToGitSubPath {
    if (-not (Test-IsSubPathMode)) { return }
    Copy-SyncTree -Source $script:WorkFolder -Dest (Get-GitSubPathOnDisk)
}

function Sync-GitSubPathToWorkFolder {
    param([switch]$DeleteExtra)
    if (-not (Test-IsSubPathMode)) { return }
    Copy-SyncTree -Source (Get-GitSubPathOnDisk) -Dest $script:WorkFolder -DeleteExtra:$DeleteExtra
}

function Get-GcmExe {
    if (-not $script:GitExe) { return $null }
    $root = Split-Path (Split-Path $script:GitExe -Parent) -Parent
    $candidates = @(
        (Join-Path $root 'mingw64\bin\git-credential-manager.exe'),
        (Join-Path $root 'mingw64\libexec\git-core\git-credential-manager.exe'),
        (Join-Path $root 'usr\bin\git-credential-manager.exe')
    )
    foreach ($path in $candidates) {
        if ([System.IO.File]::Exists($path)) { return $path }
    }
    $cmd = Get-Command git-credential-manager.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return $null
}

function Test-GitHubLoggedIn {
    $script:GhExe = Resolve-GhExe
    if ($script:GhExe) {
        $prevEap = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        & $script:GhExe auth status 2>&1 | Out-Null
        $code = $LASTEXITCODE
        $ErrorActionPreference = $prevEap
        return ($code -eq 0)
    }
    return $false
}

function Ensure-GitIdentity {
    $nameInfo = Invoke-GitRaw -AllowFail 'config' '--global' '--get' 'user.name'
    $emailInfo = Invoke-GitRaw -AllowFail 'config' '--global' '--get' 'user.email'
    $name = ($nameInfo.Lines | Select-Object -First 1)
    $email = ($emailInfo.Lines | Select-Object -First 1)
    if ([string]::IsNullOrWhiteSpace($name)) {
        Write-Host ''
        $name = Read-Host '  Git user.name (shown on commits)'
        if ([string]::IsNullOrWhiteSpace($name)) { throw 'Git user.name is required for commits.' }
        [void](Invoke-GitRaw 'config' '--global' 'user.name' $name)
    }
    if ([string]::IsNullOrWhiteSpace($email)) {
        $email = Read-Host '  Git user.email (shown on commits)'
        if ([string]::IsNullOrWhiteSpace($email)) { throw 'Git user.email is required for commits.' }
        [void](Invoke-GitRaw 'config' '--global' 'user.email' $email)
    }
    Write-Host ('  Git identity: {0}  <{1}>' -f $name.Trim(), $email.Trim()) -ForegroundColor DarkGray
}

function Invoke-GitHubLogin {
    Write-Host ''
    Write-Host '  Log in to GitHub (browser window may open).' -ForegroundColor Cyan
    Ensure-GitIdentity

    $script:GhExe = Resolve-GhExe
    if (-not $script:GhExe) {
        $winget = Get-Command winget.exe -ErrorAction SilentlyContinue
        if ($winget) {
            Write-Host '  Installing GitHub CLI for browser login...' -ForegroundColor DarkGray
            [void](Invoke-SilentProcess -FilePath $winget.Source -Arguments @(
                'install', '--id', 'GitHub.cli', '-e', '--source', 'winget',
                '--accept-package-agreements', '--accept-source-agreements', '--disable-interactivity'
            ))
            Update-SessionPath
            $script:GhExe = Resolve-GhExe
        }
    }

    if ($script:GhExe) {
        Write-Host '  Follow the GitHub CLI prompts (GitHub.com, HTTPS, login with a web browser).' -ForegroundColor DarkGray
        $p = Start-Process -FilePath $script:GhExe -ArgumentList @('auth', 'login', '--hostname', 'github.com', '--git-protocol', 'https', '--web') -Wait -PassThru -NoNewWindow
        if ($p.ExitCode -ne 0) {
            throw 'GitHub login did not complete. Run this tool again and finish the browser login.'
        }
        [void](& $script:GhExe auth setup-git 2>&1)
        if (Test-GitHubLoggedIn) {
            Write-Host '  Logged in to GitHub.' -ForegroundColor Green
            return
        }
    }

    $gcm = Get-GcmExe
    if ($gcm) {
        Write-Host '  Opening Git Credential Manager login...' -ForegroundColor DarkGray
        $p = Start-Process -FilePath $gcm -ArgumentList @('github', 'login') -Wait -PassThru -NoNewWindow
        if ($p.ExitCode -eq 0) {
            Write-Host '  Git Credential Manager login finished.' -ForegroundColor Green
            return
        }
    }

    Write-Host '  Could not start an automatic login UI. The next GitHub request may open a login prompt.' -ForegroundColor Yellow
}

function Invoke-GitHubLogout {
    Write-Host ''
    Write-Host '  Logging out of GitHub on this PC...' -ForegroundColor Cyan
    $script:GhExe = Resolve-GhExe
    if ($script:GhExe) {
        [void](& $script:GhExe auth logout --hostname github.com 2>&1)
    }
    $gcm = Get-GcmExe
    if ($gcm) {
        [void](& $gcm github logout 2>&1)
        [void](& $gcm erase 2>&1)
    }
    $reject = "protocol=https`nhost=github.com`n`n"
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $reject | & $script:GitExe credential reject 2>&1 | Out-Null
    $ErrorActionPreference = $prevEap
    Write-Host '  Logged out.' -ForegroundColor Green
    Invoke-GitHubLogin
}

function Set-ToolFileExclude {
    param([bool]$Enable)
    $gitInfo = Join-Path $script:Repo '.git\info'
    if (-not [System.IO.Directory]::Exists((Join-Path $script:Repo '.git'))) { return }
    if (-not [System.IO.Directory]::Exists($gitInfo)) {
        [void][System.IO.Directory]::CreateDirectory($gitInfo)
    }
    $excludePath = Join-Path $gitInfo 'exclude'
    $existing = ''
    if ([System.IO.File]::Exists($excludePath)) {
        $existing = [System.IO.File]::ReadAllText($excludePath)
    }
    $pattern = '(?s)' + [regex]::Escape($script:ExcludeBegin) + '.*?' + [regex]::Escape($script:ExcludeEnd) + '\r?\n?'
    $stripped = [regex]::Replace($existing, $pattern, '').TrimEnd()
    $names = @(($script:HiddenGitName + '/'))
    if ($Enable) { $names = $script:ToolFileNames + $names }
    $block = @(
        $script:ExcludeBegin
        '# Local only. Not uploaded. Created by Git Auto-Uploader.'
    ) + $names + @($script:ExcludeEnd)
    if ($stripped) {
        $newText = $stripped + "`r`n`r`n" + ($block -join "`r`n") + "`r`n"
    } else {
        $newText = ($block -join "`r`n") + "`r`n"
    }
    [System.IO.File]::WriteAllText($excludePath, $newText)
}

function Test-DirectoryHasOnlyToolFiles {
    param([string]$Path)
    if (-not [System.IO.Directory]::Exists($Path)) { return $true }
    $entries = [System.IO.Directory]::GetFileSystemEntries($Path)
    foreach ($entry in $entries) {
        $name = [System.IO.Path]::GetFileName($entry)
        if ($name -eq '.git') { continue }
        if ($name -eq $script:HiddenGitName) { continue }
        if (-not (Test-IsToolFileName $name)) { return $false }
    }
    return $true
}

function Get-OriginDefaultBranch {
    [void](Invoke-Git -AllowFail 'remote' 'set-head' 'origin' '-a')
    $sym = Invoke-Git -AllowFail 'symbolic-ref' '--short' 'refs/remotes/origin/HEAD'
    $line = ($sym.Lines | Select-Object -First 1)
    if ($sym.Code -eq 0 -and $line) {
        return ($line -replace '^origin/', '').Trim()
    }
    foreach ($guess in @('main', 'master')) {
        $chk = Invoke-Git -AllowFail 'rev-parse' '--verify' ("origin/$guess")
        if ($chk.Code -eq 0) { return $guess }
    }
    return 'main'
}

function Initialize-WorkingCopy {
    param([string]$Folder, [string]$GitUrl, [bool]$IgnoreToolFiles)

    if (-not [System.IO.Directory]::Exists($Folder)) {
        [void][System.IO.Directory]::CreateDirectory($Folder)
    }
    $script:WorkFolder = $Folder
    $script:SubPath = ([string]$script:Config.repoSubPath).Replace('\', '/').Trim('/')

    if (Test-IsSubPathMode) {
        Initialize-SubPathWorkingCopy -Folder $Folder -GitUrl $GitUrl -IgnoreToolFiles $IgnoreToolFiles
        return
    }

    $script:Repo = $Folder
    $gitDir = Join-Path $Folder '.git'

    if ([System.IO.Directory]::Exists($gitDir)) {
        Write-Host '  Existing Git repo. Setting origin...' -ForegroundColor DarkGray
        $remote = Invoke-Git -AllowFail 'remote' 'get-url' 'origin'
        if ($remote.Code -ne 0) {
            [void](Invoke-Git 'remote' 'add' 'origin' $GitUrl)
        } else {
            [void](Invoke-Git 'remote' 'set-url' 'origin' $GitUrl)
        }
    } elseif (Test-DirectoryHasOnlyToolFiles $Folder) {
        $anyFile = $false
        if ([System.IO.Directory]::Exists($Folder)) {
            $anyFile = ([System.IO.Directory]::GetFileSystemEntries($Folder).Count -gt 0)
        }
        if (-not $anyFile) {
            Write-Host '  Cloning into an empty folder...' -ForegroundColor DarkGray
            $clone = Invoke-GitRaw -AllowFail '-c' 'core.longpaths=true' 'clone' $GitUrl $Folder
            Write-GitLines $clone.Lines
            if ($clone.Code -ne 0) { throw 'git clone failed.' }
        } else {
            Write-Host '  Tool files are in this folder, so clone-into-empty cannot run. Initializing Git instead...' -ForegroundColor DarkGray
            [void](Invoke-GitRaw 'init' $Folder)
            $script:Repo = $Folder
            [void](Invoke-Git 'remote' 'add' 'origin' $GitUrl)
            $fetch = Invoke-Git -AllowFail 'fetch' 'origin'
            Write-GitLines $fetch.Lines
            if ($fetch.Code -eq 0) {
                $branch = Get-PreferredBranch
                [void](Invoke-Git -AllowFail 'branch' '-M' $branch)
                [void](Invoke-Git -AllowFail 'branch' '--set-upstream-to' ("origin/$branch") $branch)
            }
        }
    } else {
        Write-Host '  Folder already has files. Initializing Git without deleting them...' -ForegroundColor DarkGray
        [void](Invoke-GitRaw 'init' $Folder)
        $script:Repo = $Folder
        $remote = Invoke-Git -AllowFail 'remote' 'get-url' 'origin'
        if ($remote.Code -ne 0) {
            [void](Invoke-Git 'remote' 'add' 'origin' $GitUrl)
        } else {
            [void](Invoke-Git 'remote' 'set-url' 'origin' $GitUrl)
        }
        $fetch = Invoke-Git -AllowFail 'fetch' 'origin'
        Write-GitLines $fetch.Lines
        if ($fetch.Code -eq 0) {
            $branch = Get-PreferredBranch
            [void](Invoke-Git -AllowFail 'branch' '-M' $branch)
            [void](Invoke-Git -AllowFail 'branch' '--set-upstream-to' ("origin/$branch") $branch)
        }
    }

    $script:Repo = $Folder
    [void](Invoke-Git -AllowFail 'config' 'http.postBuffer' '2147483648')
    Set-ToolFileExclude -Enable $IgnoreToolFiles
    Write-Host ('  Working copy: {0}' -f $Folder) -ForegroundColor Green
}

function Get-PreferredBranch {
    if (-not [string]::IsNullOrWhiteSpace($script:Config.repoBranch)) {
        return $script:Config.repoBranch
    }
    return Get-OriginDefaultBranch
}

function Remove-FolderTree {
    param([string]$Path)
    if (-not [System.IO.Directory]::Exists($Path)) { return }
    try {
        Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
    } catch {
        [void](Start-Process -FilePath "$env:SystemRoot\System32\cmd.exe" -ArgumentList @('/c', 'rmdir', '/s', '/q', $Path) -Wait -PassThru -NoNewWindow)
    }
}

function Set-GitSparseCheckout {
    param([string]$SubPath)
    $sub = ($SubPath -replace '\\', '/').Trim('/')
    if ([string]::IsNullOrWhiteSpace($sub)) { return }

    $modern = Invoke-Git -AllowFail 'sparse-checkout' 'set' '--cone' $sub
    if ($modern.Code -eq 0) { return }

    $init = Invoke-Git -AllowFail 'sparse-checkout' 'init' '--cone'
    if ($init.Code -eq 0) {
        $set = Invoke-Git -AllowFail 'sparse-checkout' 'set' $sub
        if ($set.Code -eq 0) { return }
    }

    [void](Invoke-Git -AllowFail 'config' 'core.sparseCheckout' 'true')
    [void](Invoke-Git -AllowFail 'config' 'core.sparseCheckoutCone' 'false')
    $gitDir = ''
    $abs = Invoke-Git -AllowFail 'rev-parse' '--absolute-git-dir'
    if ($abs.Code -eq 0) {
        $gitDir = ($abs.Lines | Select-Object -First 1)
    }
    if ([string]::IsNullOrWhiteSpace($gitDir)) {
        $gitDir = Join-Path $script:Repo '.git'
    }
    $info = Join-Path $gitDir 'info'
    [void][System.IO.Directory]::CreateDirectory($info)
    $file = Join-Path $info 'sparse-checkout'
    $pattern = '/' + $sub + '/'
    $needWrite = $true
    if ([System.IO.File]::Exists($file)) {
        $existing = [System.IO.File]::ReadAllText($file)
        if ($existing.IndexOf($sub, [StringComparison]::OrdinalIgnoreCase) -ge 0) { $needWrite = $false }
    }
    if ($needWrite) {
        Write-Host '  This Git is too old for clone --sparse. Checking out only that folder.' -ForegroundColor DarkGray
    }
    [System.IO.File]::WriteAllText($file, ($pattern + "`n"), (New-Object System.Text.UTF8Encoding $false))
}

function Invoke-NoCheckoutClone {
    param([string]$GitUrl, [string]$Dest, [string]$Branch)
    $attempts = @(
        , @('-c', 'core.longpaths=true', 'clone', '--no-checkout', '--filter=blob:none')
        , @('-c', 'core.longpaths=true', 'clone', '--no-checkout')
    )
    foreach ($prefix in $attempts) {
        $cloneArgs = New-Object System.Collections.Generic.List[string]
        foreach ($a in $prefix) { [void]$cloneArgs.Add($a) }
        if (-not [string]::IsNullOrWhiteSpace($Branch)) {
            [void]$cloneArgs.Add('--branch')
            [void]$cloneArgs.Add($Branch)
            [void]$cloneArgs.Add('--single-branch')
        }
        [void]$cloneArgs.Add($GitUrl)
        [void]$cloneArgs.Add($Dest)
        Write-Host '  Cloning without checkout (skips long paths outside that folder)...' -ForegroundColor DarkGray
        $clone = Invoke-GitRaw -AllowFail @($cloneArgs.ToArray())
        Write-GitLines $clone.Lines
        if ($clone.Code -eq 0 -or (Test-HasGitDir $Dest)) { return $true }
        Remove-FolderTree $Dest
    }
    return $false
}

function Ensure-SubPathGitLayout {
    param([bool]$IgnoreToolFiles)
    Enable-GitLongPaths
    $remote = Invoke-Git -AllowFail 'remote' 'get-url' 'origin'
    if ($remote.Code -ne 0) {
        [void](Invoke-Git 'remote' 'add' 'origin' $script:Config.repoGitUrl)
    } else {
        [void](Invoke-Git 'remote' 'set-url' 'origin' $script:Config.repoGitUrl)
    }
    Set-GitSparseCheckout -SubPath $script:SubPath
    $branch = Get-PreferredBranch
    if ([string]::IsNullOrWhiteSpace($branch)) { $branch = Get-OriginDefaultBranch }
    $rt = Invoke-Git -AllowFail 'read-tree' '-mu' 'HEAD'
    $co = Invoke-Git -AllowFail 'checkout' '-f' $branch
    if ($co.Code -ne 0) {
        Write-GitLines $rt.Lines
        Write-GitLines $co.Lines
        $co = Invoke-Git -AllowFail 'checkout' '-f' '-B' $branch ("origin/$branch")
    }
    if ($co.Code -ne 0) {
        Write-GitLines $co.Lines
        $co = Invoke-Git -AllowFail 'read-tree' '-mu' 'HEAD'
    }
    if ($co.Code -ne 0) {
        Write-GitLines $co.Lines
        throw 'Could not check out that repo folder. Windows path length or an old Git checkout failed.'
    }
    [void](Invoke-Git -AllowFail 'branch' '--set-upstream-to' ("origin/$branch") $branch)
    [void](Invoke-Git -AllowFail 'config' 'http.postBuffer' '2147483648')
    Set-ToolFileExclude -Enable $IgnoreToolFiles
    try {
        $item = Get-Item -LiteralPath $script:Repo -Force
        $item.Attributes = $item.Attributes -bor [IO.FileAttributes]::Hidden
    } catch {}
}

function Initialize-SubPathWorkingCopy {
    param([string]$Folder, [string]$GitUrl, [bool]$IgnoreToolFiles)
    $hidden = Join-Path $Folder $script:HiddenGitName
    $script:Repo = $hidden
    Write-Host ('  Linking local folder to repo path: {0}' -f $script:SubPath) -ForegroundColor Cyan

    if (-not (Test-HasGitDir $hidden)) {
        if ([System.IO.Directory]::Exists($hidden)) {
            Write-Host '  Removing an incomplete .gau-repo from the last try...' -ForegroundColor Yellow
            Remove-FolderTree $hidden
        }
        $branchHint = [string]$script:Config.repoBranch
        if (-not (Invoke-NoCheckoutClone -GitUrl $GitUrl -Dest $hidden -Branch $branchHint)) {
            throw 'git clone failed.'
        }
        $script:Repo = $hidden
    } else {
        Write-Host '  Reusing .gau-repo and checking out only that folder...' -ForegroundColor DarkGray
        $fetch = Invoke-Git -AllowFail 'fetch' 'origin'
        Write-GitLines $fetch.Lines
    }

    Ensure-SubPathGitLayout -IgnoreToolFiles $IgnoreToolFiles
    if (Test-DirectoryHasOnlyToolFiles $Folder) {
        Write-Host '  Filling the local folder from that repo path...' -ForegroundColor DarkGray
        Sync-GitSubPathToWorkFolder
    } else {
        Sync-WorkFolderToGitSubPath
    }
    Write-Host ('  Git clone:    {0}' -f $hidden) -ForegroundColor DarkGray
    Write-Host ('  Local files:  {0}' -f $Folder) -ForegroundColor Green
    Write-Host ('  Repo folder:  {0}' -f $script:SubPath) -ForegroundColor Green
}

function Get-UpstreamName {
    if (-not [string]::IsNullOrWhiteSpace($script:Config.repoBranch)) {
        return ('origin/{0}' -f $script:Config.repoBranch)
    }
    $upstreamInfo = Invoke-Git -AllowFail 'rev-parse' '--abbrev-ref' '--symbolic-full-name' '@{upstream}'
    $name = ($upstreamInfo.Lines | Select-Object -First 1)
    if ($upstreamInfo.Code -eq 0 -and -not [string]::IsNullOrWhiteSpace($name)) {
        return $name.Trim()
    }
    $branch = Get-OriginDefaultBranch
    return "origin/$branch"
}

function Write-NameStatusList {
    param(
        [object[]]$RawLines,
        [string]$EmptyText = '(no file changes)'
    )
    $uniqueFiles = @(Get-NameStatusEntries -RawLines $RawLines)
    $added = 0; $removed = 0; $modified = 0; $renamed = 0; $other = 0
    Write-Host '  Files:' -ForegroundColor DarkGray
    if ($uniqueFiles.Count -eq 0) {
        Write-Host ("               $EmptyText") -ForegroundColor DarkGray
        return
    }
    foreach ($fileLine in $uniqueFiles) {
        $parts = $fileLine -split "`t"
        $code = $parts[0]
        $label = Convert-StatusCode $code
        switch ($label) {
            'Added' { $added++ }
            'Removed' { $removed++ }
            'Modified' { $modified++ }
            'Renamed' { $renamed++ }
            default { $other++ }
        }
        $color = Get-StatusColor $label
        if ($label -eq 'Renamed' -and $parts.Count -ge 3) {
            $detail = '{0}  ->  {1}' -f $parts[1], $parts[2]
        } else {
            $detail = ($parts | Select-Object -Skip 1) -join '  ->  '
        }
        Write-Host ('               {0,-12} {1}' -f $label, $detail) -ForegroundColor $color
    }
    $summaryBits = @()
    if ($added) { $summaryBits += "$added added" }
    if ($removed) { $summaryBits += "$removed removed" }
    if ($modified) { $summaryBits += "$modified modified" }
    if ($renamed) { $summaryBits += "$renamed renamed" }
    if ($other) { $summaryBits += "$other other" }
    Write-Host ('               {0} file(s): {1}' -f $uniqueFiles.Count, ($summaryBits -join ', ')) -ForegroundColor DarkGray
}

function Write-CommitDetails {
    param([string]$Hash, [int]$Index, [int]$Total)
    $meta = Invoke-Git `
        '-c' 'i18n.logOutputEncoding=utf-8' `
        'show' '-s' `
        '--format=%h%n%H%n%ad%n%an%n%ae%n%cn%n%ce%n%s' `
        '--date=format-local:%Y-%m-%d %H:%M:%S' `
        $Hash
    $lines = @($meta.Lines)
    while ($lines.Count -lt 8) { $lines += '' }
    $bodyInfo = Invoke-Git '-c' 'i18n.logOutputEncoding=utf-8' 'show' '-s' '--format=%b' $Hash
    $body = (($bodyInfo.Lines -join "`n").Trim())
    $submitter = $lines[3]
    if (-not [string]::IsNullOrWhiteSpace($lines[4])) {
        $submitter = '{0}  <{1}>' -f $lines[3], $lines[4]
    }
    Write-Host ''
    Write-Host ("  [{0}/{1}]  {2}" -f $Index, $Total, $lines[0]) -ForegroundColor Yellow
    Write-LabelValue 'Commit ID' $lines[1] 'White'
    Write-LabelValue 'Date/time' $lines[2] 'White'
    Write-LabelValue 'Submitter' $submitter 'White'
    if ($lines[5] -and ($lines[5] -ne $lines[3] -or $lines[6] -ne $lines[4])) {
        Write-LabelValue 'Committer' ('{0}  <{1}>' -f $lines[5], $lines[6]) 'DarkGray'
    }
    Write-LabelValue 'Message' $lines[7] 'White'
    if (-not [string]::IsNullOrWhiteSpace($body)) {
        foreach ($bodyLine in ($body -split "`r?`n")) {
            Write-Host ("               {0}" -f $bodyLine) -ForegroundColor Gray
        }
    }
    $fileInfo = Invoke-Git -AllowFail 'diff-tree' '--no-commit-id' '--name-status' '-r' '--find-renames' '-m' '--root' $Hash
    $fileLines = @($fileInfo.Lines)
    if (Test-IsSubPathMode) {
        $prefix = (Convert-ToGitRelPath $script:SubPath) + '/'
        $filtered = New-Object System.Collections.Generic.List[string]
        foreach ($line in $fileLines) {
            if ($line -notmatch '^[A-Z]') { continue }
            $parts = $line -split "`t"
            $changed = $false
            for ($i = 1; $i -lt $parts.Count; $i++) {
                $p = Convert-ToGitRelPath $parts[$i]
                if ($p.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase) -or $p -eq $prefix.TrimEnd('/')) {
                    $parts[$i] = $p.Substring([Math]::Min($p.Length, $prefix.Length))
                    $changed = $true
                }
            }
            if ($changed) { [void]$filtered.Add(($parts -join "`t")) }
        }
        $fileLines = $filtered
    }
    Write-NameStatusList -RawLines $fileLines
}

function Get-UncommittedEntries {
    if (Test-IsSubPathMode) {
        Sync-WorkFolderToGitSubPath
    }
    $pathArgs = @(Get-GitPathArgs)
    $entries = New-Object System.Collections.Generic.List[object]
    $cachedArgs = @('diff', '--cached', '--name-status', '--find-renames') + $pathArgs
    $cached = Invoke-Git -AllowFail @cachedArgs
    foreach ($line in @(Get-NameStatusEntries -RawLines $cached.Lines)) {
        [void]$entries.Add(@{ Line = (Convert-StatusLinePrefix $line); Area = 'staged' })
    }
    $workArgs = @('diff', '--name-status', '--find-renames') + $pathArgs
    $work = Invoke-Git -AllowFail @workArgs
    foreach ($line in @(Get-NameStatusEntries -RawLines $work.Lines)) {
        [void]$entries.Add(@{ Line = (Convert-StatusLinePrefix $line); Area = 'unstaged' })
    }
    $untrackedArgs = @('ls-files', '--others', '--exclude-standard') + $pathArgs
    $untracked = Invoke-Git -AllowFail @untrackedArgs
    foreach ($path in @($untracked.Lines)) {
        if ([string]::IsNullOrWhiteSpace($path)) { continue }
        $shown = Convert-ToGitRelPath $path
        if (Test-IsSubPathMode) {
            $prefix = (Convert-ToGitRelPath $script:SubPath) + '/'
            if ($shown.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
                $shown = $shown.Substring($prefix.Length)
            }
        }
        [void]$entries.Add(@{ Line = ("A`t$shown"); Area = 'untracked' })
    }
    return $entries
}

function Convert-StatusLinePrefix {
    param([string]$Line)
    if (-not (Test-IsSubPathMode)) { return $Line }
    $prefix = (Convert-ToGitRelPath $script:SubPath) + '/'
    $parts = $Line -split "`t"
    for ($i = 1; $i -lt $parts.Count; $i++) {
        $p = Convert-ToGitRelPath $parts[$i]
        if ($p.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
            $parts[$i] = $p.Substring($prefix.Length)
        }
    }
    return ($parts -join "`t")
}

function Write-UncommittedEntries {
    param([object[]]$Entries)
    Write-Host '  Files:' -ForegroundColor DarkGray
    if (-not $Entries -or $Entries.Count -eq 0) {
        Write-Host '               (no uncommitted files)' -ForegroundColor DarkGray
        return
    }
    $added = 0; $removed = 0; $modified = 0; $renamed = 0; $other = 0
    foreach ($entry in $Entries) {
        $parts = $entry.Line -split "`t"
        $label = Convert-StatusCode $parts[0]
        switch ($label) {
            'Added' { $added++ }
            'Removed' { $removed++ }
            'Modified' { $modified++ }
            'Renamed' { $renamed++ }
            default { $other++ }
        }
        $color = Get-StatusColor $label
        if ($label -eq 'Renamed' -and $parts.Count -ge 3) {
            $detail = '{0}  ->  {1}' -f $parts[1], $parts[2]
        } else {
            $detail = ($parts | Select-Object -Skip 1) -join '  ->  '
        }
        Write-Host ('               {0,-12} {1}  ({2})' -f $label, $detail, $entry.Area) -ForegroundColor $color
    }
    $summaryBits = @()
    if ($added) { $summaryBits += "$added added" }
    if ($removed) { $summaryBits += "$removed removed" }
    if ($modified) { $summaryBits += "$modified modified" }
    if ($renamed) { $summaryBits += "$renamed renamed" }
    if ($other) { $summaryBits += "$other other" }
    Write-Host ('               {0} file(s): {1}' -f $Entries.Count, ($summaryBits -join ', ')) -ForegroundColor DarkGray
}

function Get-RepoState {
    param([switch]$Fetch)
    $headOk = (Invoke-Git -AllowFail 'rev-parse' '--verify' 'HEAD').Code -eq 0
    $branch = (Invoke-Git -AllowFail 'rev-parse' '--abbrev-ref' 'HEAD').Lines | Select-Object -First 1
    if (-not $branch) { $branch = Get-OriginDefaultBranch }
    $headShort = ''
    $headFull = ''
    if ($headOk) {
        $headShort = (Invoke-Git 'rev-parse' '--short' 'HEAD').Lines | Select-Object -First 1
        $headFull = (Invoke-Git 'rev-parse' 'HEAD').Lines | Select-Object -First 1
    } else {
        $headShort = '(none yet)'
        $headFull = 'no commits in this folder yet'
    }
    $remoteUrl = (Invoke-Git -AllowFail 'remote' 'get-url' 'origin').Lines | Select-Object -First 1
    $upstream = Get-UpstreamName

    if ($Fetch) {
        Write-Host ''
        Write-Host '  Fetching origin...' -ForegroundColor Cyan
        $fetchResult = Invoke-Git -AllowFail 'fetch' 'origin'
        if ($fetchResult.Code -eq 0) {
            Write-Host '  Fetch complete.' -ForegroundColor DarkGray
            $upstream = Get-UpstreamName
        } else {
            Write-Host '  Fetch failed. Comparing against the last known remote.' -ForegroundColor Yellow
            Write-GitLines $fetchResult.Lines
            if (($fetchResult.Lines -join ' ') -match 'could not read Username|Authentication|403|401|fatal: repository') {
                Write-Host '  GitHub login may have expired.' -ForegroundColor Yellow
            }
        }
    }

    $pathArgs = @(Get-GitPathArgs)
    $behind = 0
    $ahead = 0
    $remoteHashes = @()
    $localHashes = @()
    if ($headOk) {
        $behindInfo = Invoke-Git -AllowFail (@('rev-list', '--count', "HEAD..$upstream") + $pathArgs)
        if ($behindInfo.Code -eq 0) {
            $behind = Get-IntCount ($behindInfo.Lines | Select-Object -First 1)
        }
        $aheadInfo = Invoke-Git -AllowFail (@('rev-list', '--count', "$upstream..HEAD") + $pathArgs)
        if ($aheadInfo.Code -eq 0) {
            $ahead = Get-IntCount ($aheadInfo.Lines | Select-Object -First 1)
        }
        if ($behind -gt 0) {
            $list = Invoke-Git -AllowFail (@('rev-list', '--reverse', "HEAD..$upstream") + $pathArgs)
            $remoteHashes = @($list.Lines | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
        }
        if ($ahead -gt 0) {
            $list = Invoke-Git -AllowFail (@('rev-list', '--reverse', "$upstream..HEAD") + $pathArgs)
            $localHashes = @($list.Lines | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
        }
    } else {
        $remoteList = Invoke-Git -AllowFail (@('rev-list', '--reverse', $upstream) + $pathArgs)
        if ($remoteList.Code -eq 0) {
            $remoteHashes = @($remoteList.Lines | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
            $behind = $remoteHashes.Count
        }
    }

    return @{
        Branch = $branch
        HeadShort = $headShort
        HeadFull = $headFull
        HeadOk = $headOk
        RemoteUrl = $remoteUrl
        Upstream = $upstream
        Behind = $behind
        Ahead = $ahead
        RemoteHashes = $remoteHashes
        LocalHashes = $localHashes
        Uncommitted = @(Get-UncommittedEntries)
    }
}

function Write-Report {
    param($State)
    Clear-Host
    Write-Host ''
    Write-Host ' Git Auto-Uploader' -ForegroundColor Cyan
    Write-Rule
    Write-LabelValue 'Folder' $script:WorkFolder 'Gray'
    Write-LabelValue 'Git' $script:GitExe 'Gray'
    Write-LabelValue 'Branch' $State.Branch 'Gray'
    Write-LabelValue 'HEAD' ('{0}  ({1})' -f $State.HeadShort, $State.HeadFull) 'Gray'
    Write-LabelValue 'Remote' $State.RemoteUrl 'Gray'
    if (Test-IsSubPathMode) {
        Write-LabelValue 'Repo path' $script:SubPath 'Yellow'
    } else {
        Write-LabelValue 'Repo path' '(repository root)' 'Gray'
    }
    Write-LabelValue 'Compare' ('HEAD <-> {0}' -f $State.Upstream) 'Gray'
    $ignoreText = 'no (tool files can be committed)'
    if ($script:Config.ignoreToolFiles) { $ignoreText = 'yes (GAU files excluded from Push)' }
    Write-LabelValue 'Ignore GAU' $ignoreText 'Gray'

    Write-Host ''
    Write-Host ' Remote commits newer than this folder' -ForegroundColor Cyan
    Write-Rule
    if ($State.Behind -eq 0) {
        Write-Host '  Up to date. No newer commits on the remote.' -ForegroundColor Green
    } else {
        Write-Host ("  Newer commits: {0}" -f $State.Behind) -ForegroundColor Yellow
        Write-Host '  Listed oldest-first (the order git pull would apply them).' -ForegroundColor DarkGray
        $i = 0
        foreach ($hash in $State.RemoteHashes) {
            $i++
            Write-CommitDetails -Hash $hash -Index $i -Total $State.Behind
        }
    }

    Write-Host ''
    Write-Host ' Your changes that are not on the Git repo' -ForegroundColor Cyan
    Write-Rule
    $hasUncommitted = ($State.Uncommitted.Count -gt 0)
    $hasLocalCommits = ($State.Ahead -gt 0)
    if (-not $hasUncommitted -and -not $hasLocalCommits) {
        Write-Host '  None. This folder has nothing waiting to send.' -ForegroundColor Green
    } else {
        if ($hasUncommitted) {
            Write-Host ("  Uncommitted files: {0}  (on this machine only, not a commit yet)" -f $State.Uncommitted.Count) -ForegroundColor Yellow
            Write-UncommittedEntries -Entries $State.Uncommitted
            Write-Host '  Use C to commit these, then push.' -ForegroundColor DarkGray
        } else {
            Write-Host '  Uncommitted files: none' -ForegroundColor DarkGray
        }
        if ($hasLocalCommits) {
            Write-Host ''
            Write-Host ("  Local commits not on the remote: {0}" -f $State.Ahead) -ForegroundColor Yellow
            Write-Host '  Listed oldest-first (the order git push would send them).' -ForegroundColor DarkGray
            $i = 0
            foreach ($hash in $State.LocalHashes) {
                $i++
                Write-CommitDetails -Hash $hash -Index $i -Total $State.Ahead
            }
        } else {
            Write-Host '  Local commits not on the remote: none' -ForegroundColor DarkGray
        }
    }

    Write-Host ''
    Write-Rule
    if ($State.Behind -gt 0) {
        Write-Host ("  Remote is ahead by {0} commit(s)." -f $State.Behind) -ForegroundColor Yellow
    } else {
        Write-Host '  Remote is not ahead of you.' -ForegroundColor DarkGray
    }
    if ($hasLocalCommits -or $hasUncommitted) {
        $bits = @()
        if ($hasLocalCommits) { $bits += ("{0} unpushed commit(s)" -f $State.Ahead) }
        if ($hasUncommitted) { $bits += ("{0} uncommitted file(s)" -f $State.Uncommitted.Count) }
        Write-Host ("  You have {0} not on the Git repo." -f ($bits -join ' and ')) -ForegroundColor Yellow
    } else {
        Write-Host '  You have no local changes missing from the Git repo.' -ForegroundColor DarkGray
    }
}

function Invoke-GitPull {
    param($State)
    if ($State.Behind -le 0) {
        Write-Host ''
        Write-Host '  Nothing to pull. The remote has no newer commits.' -ForegroundColor Green
        return
    }
    if ($State.Uncommitted.Count -gt 0) {
        Write-Host ''
        Write-Host '  You have uncommitted files. Pull can fail if those overlap incoming files.' -ForegroundColor Yellow
    }
    Write-Host ''
    if (-not (Confirm-Yes ("  Git Pull {0} commit(s) from {1} now? [Y/N]" -f $State.Behind, $State.Upstream))) {
        Write-Host '  Pull cancelled.' -ForegroundColor DarkGray
        return
    }
    Write-Host '  Pulling...' -ForegroundColor Cyan
    $branch = $State.Branch
    if ($branch -eq 'HEAD' -or [string]::IsNullOrWhiteSpace($branch)) {
        $branch = Get-PreferredBranch
    }
    $result = Invoke-Git -AllowFail 'pull' '--progress' 'origin' $branch
    Write-GitLines $result.Lines
    if ($result.Code -eq 0) {
        if (Test-IsSubPathMode) {
            Sync-GitSubPathToWorkFolder
            Write-Host '  Copied that repo folder into your local folder.' -ForegroundColor DarkGray
        }
        Write-Host '  Pull complete.' -ForegroundColor Green
    } else {
        Write-Host '  Pull failed. Your files were left as they are.' -ForegroundColor Red
    }
}

function Invoke-GitForcePull {
    param($State)
    Write-Host ''
    if (Test-IsSubPathMode) {
        Write-Host ('  FORCE PULL replaces this folder with GitHub path:' ) -ForegroundColor Red
        Write-Host ('  {0}' -f $script:SubPath) -ForegroundColor Red
    } else {
        Write-Host '  FORCE PULL replaces this folder with the GitHub repo.' -ForegroundColor Red
    }
    Write-Host '  This overwrites conflicting and edited tracked files.' -ForegroundColor Yellow
    Write-Host '  It also drops local commits that were never pushed,' -ForegroundColor Yellow
    Write-Host '  and deletes untracked files that are not ignored.' -ForegroundColor Yellow
    if ($script:Config.ignoreToolFiles) {
        Write-Host '  GAU tool files stay (they are excluded).' -ForegroundColor DarkGray
    }
    Write-Host ''
    $ans = Read-Host '  Type FORCE to overwrite local files with the remote repo'
    if ($ans -cne 'FORCE') {
        Write-Host '  Force Pull cancelled.' -ForegroundColor DarkGray
        return
    }

    Write-Host '  Fetching origin...' -ForegroundColor Cyan
    $fetch = Invoke-Git -AllowFail 'fetch' 'origin'
    Write-GitLines $fetch.Lines
    if ($fetch.Code -ne 0) {
        Write-Host '  Fetch failed. Force Pull stopped; local files were not reset.' -ForegroundColor Red
        return
    }

    $target = $State.Upstream
    if ([string]::IsNullOrWhiteSpace($target) -or $target -eq 'origin/') {
        $target = 'origin/' + (Get-OriginDefaultBranch)
    }
    Write-Host ("  Resetting hard to {0}..." -f $target) -ForegroundColor Cyan
    $reset = Invoke-Git -AllowFail 'reset' '--hard' $target
    Write-GitLines $reset.Lines
    if ($reset.Code -ne 0) {
        Write-Host '  git reset --hard failed. Local files may be unchanged.' -ForegroundColor Red
        return
    }

    Write-Host '  Removing untracked files that are not on the repo...' -ForegroundColor Cyan
    $clean = Invoke-Git -AllowFail 'clean' '-fd'
    Write-GitLines $clean.Lines
    if ($clean.Code -ne 0) {
        Write-Host '  Reset succeeded, but git clean reported a problem.' -ForegroundColor Yellow
        return
    }
    Write-Host '  Force Pull complete. This folder matches the remote.' -ForegroundColor Green
    if (Test-IsSubPathMode) {
        Sync-GitSubPathToWorkFolder -DeleteExtra
        Write-Host '  Local folder overwritten from that path in the repo.' -ForegroundColor DarkGray
    }
}

function Get-RelFileSize {
    param([string]$RelPath)
    $full = Join-Path $script:Repo ($RelPath -replace '/', '\')
    if ([System.IO.File]::Exists($full)) {
        return ([System.IO.FileInfo]$full).Length
    }
    return [int64]0
}

function Get-StagedFileSpecs {
    $cachedArgs = @('diff', '--cached', '--name-status', '--find-renames') + @(Get-GitPathArgs)
    $info = Invoke-Git -AllowFail @cachedArgs
    $specs = New-Object System.Collections.Generic.List[object]
    foreach ($line in @(Get-NameStatusEntries -RawLines $info.Lines)) {
        $parts = $line -split "`t"
        $code = $parts[0]
        $paths = @($parts | Select-Object -Skip 1 | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
        if ($paths.Count -eq 0) { continue }
        $size = [int64]0
        $isDelete = ($code.Substring(0, 1) -eq 'D')
        foreach ($p in $paths) {
            $size += Get-RelFileSize $p
        }
        [void]$specs.Add(@{
            Line = $line
            Code = $code
            Paths = $paths
            Size = $size
            IsDelete = $isDelete
        })
        if ($size -gt $script:GitHubFileLimitBytes) {
            Write-Host ("  Warning: {0} is {1} (GitHub file limit is 100 MiB)." -f $paths[-1], (Format-Bytes $size)) -ForegroundColor Yellow
        }
        if ($size -gt $script:MaxPushBytes) {
            Write-Host ("  Warning: {0} is {1}, larger than the 1.8 GiB auto-split cap. This file cannot be pushed over HTTPS as one pack." -f $paths[-1], (Format-Bytes $size)) -ForegroundColor Red
        }
    }
    return $specs
}

function Split-FileSpecsIntoBatches {
    param($Specs)
    $batches = New-Object System.Collections.Generic.List[object]
    $sorted = @($Specs | Sort-Object { -$_.Size })
    foreach ($spec in $sorted) {
        $placed = $false
        if ($spec.Size -le $script:MaxPushBytes) {
            foreach ($batch in $batches) {
                $sum = [int64]0
                foreach ($item in $batch) { $sum += $item.Size }
                if (($sum + $spec.Size) -le $script:MaxPushBytes) {
                    [void]$batch.Add($spec)
                    $placed = $true
                    break
                }
            }
        }
        if (-not $placed) {
            $batch = New-Object System.Collections.Generic.List[object]
            [void]$batch.Add($spec)
            [void]$batches.Add($batch)
        }
    }
    return $batches
}

function Invoke-GitAddPaths {
    param([string[]]$Paths)
    if (-not $Paths -or $Paths.Count -eq 0) { return @{ Code = 0; Lines = @() } }
    $normalized = @($Paths | ForEach-Object { $_ -replace '\\', '/' })
    $tmp = Join-Path $env:TEMP ('gau-add-' + [guid]::NewGuid().ToString() + '.txt')
    [System.IO.File]::WriteAllLines($tmp, $normalized)
    $result = Invoke-Git -AllowFail 'add' '-A' '--pathspec-from-file' $tmp
    if ($result.Code -ne 0) {
        $result = Invoke-Git -AllowFail 'add' '-A' '--' @normalized
    }
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
    return $result
}

function Get-ApproxUnpushedBytes {
    param($State)
    if (-not $State.HeadOk) { return [int64]0 }
    $diffArgs = @('diff', '--name-only', $State.Upstream, 'HEAD') + @(Get-GitPathArgs)
    $diff = Invoke-Git -AllowFail @diffArgs
    $sum = [int64]0
    foreach ($path in $diff.Lines) {
        if ([string]::IsNullOrWhiteSpace($path)) { continue }
        $sum += Get-RelFileSize $path
    }
    return $sum
}

function Invoke-GitPushCommits {
    param($State)
    $remoteBranch = $State.Upstream -replace '^origin/', ''
    if ([string]::IsNullOrWhiteSpace($remoteBranch)) { $remoteBranch = Get-OriginDefaultBranch }

    $hashes = @()
    if ($State.HeadOk) {
        $list = Invoke-Git -AllowFail 'rev-list' '--reverse' ("{0}..HEAD" -f $State.Upstream)
        if ($list.Code -eq 0) {
            $hashes = @($list.Lines | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
        }
    }
    if ($hashes.Count -eq 0) {
        Write-Host '  Nothing to push.' -ForegroundColor Green
        return $true
    }

    $approx = Get-ApproxUnpushedBytes -State $State
    $splitPush = ($approx -ge $script:MaxPushBytes) -or ($hashes.Count -gt 1 -and $approx -ge [int64](0.9 * $script:MaxPushBytes))
    if ($splitPush -and $hashes.Count -gt 1) {
        Write-Host ("  Unpushed data is about {0}. Pushing {1} commit(s) one at a time to stay under GitHub's ~2 GiB pack limit." -f (Format-Bytes $approx), $hashes.Count) -ForegroundColor Yellow
        $i = 0
        foreach ($sha in $hashes) {
            $i++
            Write-Host ("  Pushing commit {0}/{1} ({2})..." -f $i, $hashes.Count, $sha.Substring(0, [Math]::Min(8, $sha.Length))) -ForegroundColor Cyan
            $result = Invoke-Git -AllowFail 'push' '--progress' 'origin' ('{0}:refs/heads/{1}' -f $sha, $remoteBranch)
            Write-GitLines $result.Lines
            if ($result.Code -ne 0) {
                Write-Host '  Push failed. Remaining commits are still local.' -ForegroundColor Red
                return $false
            }
        }
        Write-Host '  Push complete.' -ForegroundColor Green
        return $true
    }

    Write-Host '  Pushing...' -ForegroundColor Cyan
    $result = Invoke-Git -AllowFail 'push' '--progress' '-u' 'origin' ('HEAD:{0}' -f $remoteBranch)
    if ($result.Code -ne 0) {
        $result = Invoke-Git -AllowFail 'push' '--progress' 'origin' 'HEAD'
    }
    Write-GitLines $result.Lines
    if ($result.Code -eq 0) {
        Write-Host '  Push complete.' -ForegroundColor Green
        return $true
    }
    Write-Host '  Push failed. The commit (if any) is still local.' -ForegroundColor Red
    return $false
}

function Invoke-GitCommitAndPush {
    param($State)
    $hasUncommitted = ($State.Uncommitted.Count -gt 0)
    $hasLocalCommits = ($State.Ahead -gt 0)
    if (-not $hasUncommitted -and -not $hasLocalCommits) {
        Write-Host ''
        Write-Host '  Nothing to commit or push.' -ForegroundColor Green
        return
    }

    if ($State.Behind -gt 0) {
        Write-Host ''
        Write-Host '  The remote also has newer commits. Pull first is usually safer, then Commit+Push.' -ForegroundColor Yellow
    }

    if ($hasUncommitted) {
        Write-Host ''
        Write-Host ("  These {0} file(s) will be committed, then pushed:" -f $State.Uncommitted.Count) -ForegroundColor Yellow
        Write-UncommittedEntries -Entries $State.Uncommitted
        Write-Host ''
        $message = Read-Host '  Commit message'
        if ([string]::IsNullOrWhiteSpace($message)) {
            Write-Host '  Commit cancelled (empty message). Nothing was pushed.' -ForegroundColor DarkGray
            return
        }

        Write-Host '  Copying local files into the repo path...' -ForegroundColor Cyan
        if (Test-IsSubPathMode) { Sync-WorkFolderToGitSubPath }
        Write-Host '  Staging all local changes...' -ForegroundColor Cyan
        $addArgs = @('add', '-A')
        if (Test-IsSubPathMode) { $addArgs += @('--', $script:SubPath) }
        $add = Invoke-Git -AllowFail @addArgs
        if ($add.Code -ne 0) {
            Write-GitLines $add.Lines
            Write-Host '  git add failed. Nothing was committed or pushed.' -ForegroundColor Red
            return
        }

        $specs = @(Get-StagedFileSpecs)
        if ($specs.Count -eq 0) {
            Write-Host '  Nothing staged (all changes may be ignored). Nothing was pushed.' -ForegroundColor Yellow
            return
        }

        $total = [int64]0
        foreach ($s in $specs) { $total += $s.Size }
        $batches = @(Split-FileSpecsIntoBatches -Specs $specs)
        Write-Host ("  Staged size about {0} in {1} commit batch(es) (cap {2})." -f (Format-Bytes $total), $batches.Count, (Format-Bytes $script:MaxPushBytes)) -ForegroundColor DarkGray

        $needSplit = ($batches.Count -gt 1)
        if (-not $needSplit) {
            $commit = Invoke-Git -AllowFail 'commit' '-m' $message
            Write-GitLines $commit.Lines
            if ($commit.Code -ne 0) {
                Write-Host '  Commit failed. Nothing was pushed.' -ForegroundColor Red
                return
            }
            Write-Host ('  Commit complete: ' + $message) -ForegroundColor Green
            $pushState = Get-RepoState
            [void](Invoke-GitPushCommits -State $pushState)
            return
        }

        [void](Invoke-Git -AllowFail 'reset' '-q')

        $n = $batches.Count
        $bi = 0
        foreach ($batch in $batches) {
            $bi++
            $msg = $message
            if ($n -gt 1) { $msg = '{0} {1}' -f $message, $bi }
            $paths = New-Object System.Collections.Generic.List[string]
            $batchSize = [int64]0
            foreach ($spec in $batch) {
                $batchSize += $spec.Size
                foreach ($p in $spec.Paths) { [void]$paths.Add($p) }
            }
            Write-Host ("  Commit {0}/{1} ({2}, {3} path(s))..." -f $bi, $n, (Format-Bytes $batchSize), $paths.Count) -ForegroundColor Cyan
            $addBatch = Invoke-GitAddPaths -Paths @($paths)
            if ($addBatch.Code -ne 0) {
                Write-GitLines $addBatch.Lines
                Write-Host '  Staging this batch failed. Stopping. Earlier batches may already be committed/pushed.' -ForegroundColor Red
                return
            }
            $commit = Invoke-Git -AllowFail 'commit' '-m' $msg
            Write-GitLines $commit.Lines
            if ($commit.Code -ne 0) {
                Write-Host '  Commit failed. Stopping before further batches.' -ForegroundColor Red
                return
            }
            Write-Host ('  Commit complete: ' + $msg) -ForegroundColor Green
            $pushState = Get-RepoState
            if (-not (Invoke-GitPushCommits -State $pushState)) { return }
        }
        return
    }

    Write-Host ''
    Write-Host ("  No uncommitted files. Pushing {0} existing local commit(s)." -f $State.Ahead) -ForegroundColor Yellow
    if (-not (Confirm-Yes '  Continue with Git Push only? [Y/N]')) {
        Write-Host '  Push cancelled.' -ForegroundColor DarkGray
        return
    }
    [void](Invoke-GitPushCommits -State $State)
}

function Invoke-SwitchRepo {
    $parsed = Read-RepoLink
    Save-ParsedRepoToConfig -Parsed $parsed
    Save-GauConfig
    Initialize-WorkingCopy -Folder $script:Config.folderPath -GitUrl $parsed.GitUrl -IgnoreToolFiles $script:Config.ignoreToolFiles
    Write-Host '  Repo link updated.' -ForegroundColor Green
}

function Invoke-SwitchFolder {
    $choice = Read-FolderPath
    $script:Config.folderPath = $choice.Path
    $script:Config.ignoreToolFiles = $choice.IgnoreToolFiles
    Save-GauConfig
    Initialize-WorkingCopy -Folder $choice.Path -GitUrl $script:Config.repoGitUrl -IgnoreToolFiles $choice.IgnoreToolFiles
}

function Invoke-FirstSetup {
    Write-Host ''
    Write-Host ' First-time setup' -ForegroundColor Cyan
    Write-Rule
    Invoke-GitHubLogin
    $parsed = Read-RepoLink
    $folder = Read-FolderPath
    Save-ParsedRepoToConfig -Parsed $parsed
    $script:Config.folderPath = $folder.Path
    $script:Config.ignoreToolFiles = $folder.IgnoreToolFiles
    $script:Config.setupComplete = $true
    Save-GauConfig
    Initialize-WorkingCopy -Folder $folder.Path -GitUrl $parsed.GitUrl -IgnoreToolFiles $folder.IgnoreToolFiles
}

function Wait-ToClose {
    Write-Host ''
    Write-Host '  The window will stay open. Press Enter to close.' -ForegroundColor DarkGray
    try { [void](Read-Host) } catch {}
}

$exitCode = 0
try {
    $script:ToolDir = $PSScriptRoot
    if ([string]::IsNullOrEmpty($script:ToolDir)) {
        $script:ToolDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    }
    $script:ConfigPath = Join-Path $script:ToolDir 'gau-config.json'

    Write-Host ''
    Write-Host ' Git Auto-Uploader' -ForegroundColor Cyan
    Write-Rule
    Ensure-Git
    Load-GauConfig
    Repair-ConfigRepoPath

    $needSetup = -not $script:Config.setupComplete -or
        [string]::IsNullOrWhiteSpace($script:Config.repoGitUrl) -or
        [string]::IsNullOrWhiteSpace($script:Config.folderPath)

    if ($needSetup) {
        Invoke-FirstSetup
    } else {
        Set-GitRuntimeFromConfig
        $gitOk = Test-HasGitDir $script:Repo
        if (-not $gitOk) {
            Write-Host '  Saved Git clone is missing. Setting the folder up again...' -ForegroundColor Yellow
            Initialize-WorkingCopy -Folder $script:Config.folderPath -GitUrl $script:Config.repoGitUrl -IgnoreToolFiles $script:Config.ignoreToolFiles
        } elseif (Test-IsSubPathMode) {
            Write-Host '  Making sure only the linked folder is checked out...' -ForegroundColor DarkGray
            Ensure-SubPathGitLayout -IgnoreToolFiles ([bool]$script:Config.ignoreToolFiles)
        } else {
            Enable-GitLongPaths
            Set-ToolFileExclude -Enable ([bool]$script:Config.ignoreToolFiles)
        }
        if (-not (Test-GitHubLoggedIn)) {
            Write-Host '  Not logged in to GitHub.' -ForegroundColor Yellow
            Invoke-GitHubLogin
        }
    }

    $quit = $false
    $needFetch = $true
    while (-not $quit) {
        $state = Get-RepoState -Fetch:$needFetch
        $needFetch = $false
        Write-Report -State $state
        Write-Host ''
        Write-Host '  [P] Pull   [F] Force Pull   [C] Commit+Push   [R] Recheck   [L] Log out   [Z] Switch repo   [X] Switch folder   [Q] Quit' -ForegroundColor Cyan
        $choice = Read-Host '  Choose'
        switch -Regex ($choice) {
            '^[Pp]$' {
                Invoke-GitPull -State $state
                $needFetch = $true
                Write-Host ''
                [void](Read-Host '  Press Enter to refresh the report')
            }
            '^[Ff]$' {
                Invoke-GitForcePull -State $state
                $needFetch = $true
                Write-Host ''
                [void](Read-Host '  Press Enter to refresh the report')
            }
            '^[Cc]$' {
                Invoke-GitCommitAndPush -State $state
                $needFetch = $true
                Write-Host ''
                [void](Read-Host '  Press Enter to refresh the report')
            }
            '^[Rr]$' { $needFetch = $true }
            '^[Ll]$' {
                Invoke-GitHubLogout
                $needFetch = $true
                Write-Host ''
                [void](Read-Host '  Press Enter to refresh the report')
            }
            '^[Zz]$' {
                Invoke-SwitchRepo
                $needFetch = $true
                Write-Host ''
                [void](Read-Host '  Press Enter to refresh the report')
            }
            '^[Xx]$' {
                Invoke-SwitchFolder
                $needFetch = $true
                Write-Host ''
                [void](Read-Host '  Press Enter to refresh the report')
            }
            '^[Qq]$' { $quit = $true }
            default {
                Write-Host '  Use P, F, C, R, L, Z, X, or Q.' -ForegroundColor Yellow
                Write-Host ''
                [void](Read-Host '  Press Enter to continue')
            }
        }
    }
} catch {
    $exitCode = 1
    Write-Host ''
    Write-Host ('  ERROR: ' + $_.Exception.Message) -ForegroundColor Red
} finally {
    Wait-ToClose
    exit $exitCode
}
