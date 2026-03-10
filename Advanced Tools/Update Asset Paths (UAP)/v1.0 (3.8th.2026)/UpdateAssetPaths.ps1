param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('MV', 'MZ')]
    [string]$Engine,

    [Parameter(Mandatory = $true)]
    [string]$RootDir
)

$ErrorActionPreference = 'Stop'

function Decode-JsonString([string]$s) {
    try {
        return (ConvertFrom-Json ('"' + $s + '"'))
    } catch {
        return $s
    }
}

function Encode-JsonString([string]$s) {
    $json = ConvertTo-Json $s -Compress
    return $json.Substring(1, $json.Length - 2)
}

function Normalize-Ref([string]$ref) {
    if ([string]::IsNullOrWhiteSpace($ref)) { return '' }
    $n = $ref.Trim() -replace '\\', '/'
    $n = $n.TrimStart('./')
    return $n
}

function Test-AssetByReference {
    param(
        [string]$AssetRoot,
        [string]$Reference
    )

    $norm = Normalize-Ref $Reference
    if ([string]::IsNullOrWhiteSpace($norm)) { return $false }

    $leaf = [System.IO.Path]::GetFileName($norm)
    $dir = [System.IO.Path]::GetDirectoryName($norm)
    $hasExt = [System.IO.Path]::HasExtension($leaf)

    $baseDir = if ([string]::IsNullOrWhiteSpace($dir)) { $AssetRoot } else { Join-Path $AssetRoot ($dir -replace '/', '\\') }
    if (-not (Test-Path -LiteralPath $baseDir)) { return $false }

    if ($hasExt) {
        $full = Join-Path $baseDir $leaf
        return (Test-Path -LiteralPath $full)
    }

    $matches = Get-ChildItem -LiteralPath $baseDir -File -Filter ($leaf + '.*') -ErrorAction SilentlyContinue |
        Where-Object { $_.BaseName -ieq $leaf }
    return ($matches.Count -gt 0)
}

function Find-AssetRelativePath {
    param(
        [string]$AssetRoot,
        [string]$Reference
    )

    $result = [pscustomobject]@{
        ResolvedRef = $null
        DuplicateRelativePaths = @()
    }

    $norm = Normalize-Ref $Reference
    if ([string]::IsNullOrWhiteSpace($norm)) { return $result }

    $leaf = [System.IO.Path]::GetFileName($norm)
    if ([string]::IsNullOrWhiteSpace($leaf)) { return $result }

    $baseLeaf = if ([System.IO.Path]::HasExtension($leaf)) { [System.IO.Path]::GetFileNameWithoutExtension($leaf) } else { $leaf }

    $matches = Get-ChildItem -LiteralPath $AssetRoot -Recurse -File -Filter ($baseLeaf + '.*') -ErrorAction SilentlyContinue |
        Where-Object { $_.BaseName -ieq $baseLeaf } |
        Sort-Object FullName

    if (-not $matches -or $matches.Count -eq 0) { return $result }

    # Treat same relative path with different file extensions as one logical asset.
    $relativeNoExtMap = @{}
    foreach ($match in $matches) {
        $relDir = $match.Directory.FullName.Substring($AssetRoot.Length).TrimStart('\\') -replace '\\', '/'
        $relativeNoExt = if ([string]::IsNullOrWhiteSpace($relDir)) { $baseLeaf } else { $relDir + '/' + $baseLeaf }
        $relativeKey = $relativeNoExt.ToLowerInvariant()
        if (-not $relativeNoExtMap.ContainsKey($relativeKey)) {
            $relativeNoExtMap[$relativeKey] = $relativeNoExt
        }
    }

    $relativeNoExtPaths = @($relativeNoExtMap.Values | Sort-Object)
    if ($relativeNoExtPaths.Count -eq 0) { return $result }

    $result.ResolvedRef = $relativeNoExtPaths[0]
    if ($relativeNoExtPaths.Count -gt 1) {
        $result.DuplicateRelativePaths = @($relativeNoExtPaths | Select-Object -Skip 1)
    }

    return $result
}

function Get-LineNumberFromIndex {
    param(
        [string]$Text,
        [int]$Index
    )

    if ($Index -lt 0) { return 1 }
    $segment = if ($Index -eq 0) { '' } else { $Text.Substring(0, $Index) }
    return ([regex]::Matches($segment, "`r`n|`n").Count + 1)
}

function Test-AnimationIdExists {
    param(
        [int]$AnimationId,
        [hashtable]$AnimationIdSet
    )

    if ($AnimationId -le 0) { return $true }
    return $AnimationIdSet.ContainsKey($AnimationId)
}

function Write-DedupWarning {
    param(
        [string]$Key,
        [string]$Message
    )

    if ($script:warningSeen.ContainsKey($Key)) {
        return
    }

    $script:warningSeen[$Key] = $true
    $script:totalWarnings++
    Write-Host $Message
}

$RootDir = $RootDir.Trim('"')
$RootDir = (Resolve-Path -LiteralPath $RootDir).Path
$DataRoot = Join-Path $RootDir 'data'

if ($Engine -ieq 'MV') {
    $AssetRoots = @{
        Enemy = Join-Path $RootDir 'img/enemies'
        Picture = Join-Path $RootDir 'img/pictures'
        Animation = Join-Path $RootDir 'img/animations'
        Battleback1 = Join-Path $RootDir 'img/battlebacks1'
        Battleback2 = Join-Path $RootDir 'img/battlebacks2'
        Parallax = Join-Path $RootDir 'img/parallaxes'
        Character = Join-Path $RootDir 'img/characters'
        Face = Join-Path $RootDir 'img/faces'
        SvActor = Join-Path $RootDir 'img/sv_actors'
        Movie = Join-Path $RootDir 'movies'
        Bgm = Join-Path $RootDir 'audio/bgm'
        Bgs = Join-Path $RootDir 'audio/bgs'
        Me = Join-Path $RootDir 'audio/me'
        Se = Join-Path $RootDir 'audio/se'
    }
} elseif ($Engine -ieq 'MZ') {
    $AssetRoots = @{
        Enemy = Join-Path $RootDir 'img/enemies'
        Picture = Join-Path $RootDir 'img/pictures'
        Animation = Join-Path $RootDir 'effects'
        Battleback1 = Join-Path $RootDir 'img/battlebacks1'
        Battleback2 = Join-Path $RootDir 'img/battlebacks2'
        Parallax = Join-Path $RootDir 'img/parallaxes'
        Character = Join-Path $RootDir 'img/characters'
        Face = Join-Path $RootDir 'img/faces'
        SvActor = Join-Path $RootDir 'img/sv_actors'
        Movie = Join-Path $RootDir 'movies'
        Bgm = Join-Path $RootDir 'audio/bgm'
        Bgs = Join-Path $RootDir 'audio/bgs'
        Me = Join-Path $RootDir 'audio/me'
        Se = Join-Path $RootDir 'audio/se'
    }
}

if (-not (Test-Path -LiteralPath $DataRoot)) {
    throw "Data folder not found: $DataRoot"
}

$animationsPath = Join-Path $DataRoot 'Animations.json'
$animationIdSet = @{}
if (Test-Path -LiteralPath $animationsPath) {
    $animationsData = Get-Content -LiteralPath $animationsPath -Raw | ConvertFrom-Json
    foreach ($anim in $animationsData) {
        if ($null -ne $anim -and $null -ne $anim.id) {
            $animationIdSet[[int]$anim.id] = $true
        }
    }
}

$patterns = @(
    @{ Code = 101; AssetType = 'Face'; Pattern = '"code"\s*:\s*101\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 132; AssetType = 'Bgm'; Pattern = '"code"\s*:\s*132\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*\{\s*"name"\s*:\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 133; AssetType = 'Me'; Pattern = '"code"\s*:\s*133\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*\{\s*"name"\s*:\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 139; AssetType = 'Me'; Pattern = '"code"\s*:\s*139\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*\{\s*"name"\s*:\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 140; AssetType = 'Bgm'; Pattern = '"code"\s*:\s*140\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*-?\d+\s*,\s*\{\s*"name"\s*:\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 231; AssetType = 'Picture'; Pattern = '"code"\s*:\s*231\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*-?\d+\s*,\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 241; AssetType = 'Bgm'; Pattern = '"code"\s*:\s*241\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*\{\s*"name"\s*:\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 245; AssetType = 'Bgs'; Pattern = '"code"\s*:\s*245\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*\{\s*"name"\s*:\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 249; AssetType = 'Me'; Pattern = '"code"\s*:\s*249\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*\{\s*"name"\s*:\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 250; AssetType = 'Se'; Pattern = '"code"\s*:\s*250\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*\{\s*"name"\s*:\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 261; AssetType = 'Movie'; Pattern = '"code"\s*:\s*261\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 283; AssetType = 'Battleback1'; Pattern = '"code"\s*:\s*283\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 283; AssetType = 'Battleback2'; Pattern = '"code"\s*:\s*283\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*"(?:\\.|[^"\\])*"\s*,\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 284; AssetType = 'Parallax'; Pattern = '"code"\s*:\s*284\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 322; AssetType = 'Character'; Pattern = '"code"\s*:\s*322\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*-?\d+\s*,\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 322; AssetType = 'Face'; Pattern = '"code"\s*:\s*322\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*-?\d+\s*,\s*"(?:\\.|[^"\\])*"\s*,\s*-?\d+\s*,\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 322; AssetType = 'SvActor'; Pattern = '"code"\s*:\s*322\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*-?\d+\s*,\s*"(?:\\.|[^"\\])*"\s*,\s*-?\d+\s*,\s*"(?:\\.|[^"\\])*"\s*,\s*-?\d+\s*,\s*"(?<asset>(?:\\.|[^"\\])*)"' },
    @{ Code = 323; AssetType = 'Character'; Pattern = '"code"\s*:\s*323\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*-?\d+\s*,\s*"(?<asset>(?:\\.|[^"\\])*)"' }
)

$animationIdPatterns = @(
    @{ Code = 212; Pattern = '"code"\s*:\s*212\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*-?\d+\s*,\s*(?<animId>-?\d+)' },
    @{ Code = 337; Pattern = '"code"\s*:\s*337\s*,\s*"indent"\s*:\s*-?\d+\s*,\s*"parameters"\s*:\s*\[\s*-?\d+\s*,\s*(?<animId>-?\d+)' }
)

$jsonFiles = Get-ChildItem -LiteralPath $DataRoot -File -Filter '*.json' | Sort-Object Name

$script:totalFiles = 0
$script:changedFiles = 0
$script:totalFixes = 0
$script:totalWarnings = 0
$script:warningSeen = @{}

foreach ($file in $jsonFiles) {
    $script:totalFiles++
    $originalText = Get-Content -LiteralPath $file.FullName -Raw
    $updatedText = $originalText
    $fileFixes = 0

    foreach ($entry in $patterns) {
        $code = [int]$entry.Code
        $assetType = $entry.AssetType
        $assetRoot = $AssetRoots[$assetType]
        $regex = [regex]::new($entry.Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

        $updatedText = $regex.Replace($updatedText, {
            param($m)

            $assetRaw = $m.Groups['asset'].Value
            $assetRef = Decode-JsonString $assetRaw

            if ([string]::IsNullOrWhiteSpace($assetRef)) {
                return $m.Value
            }

            $normalizedCurrent = Normalize-Ref $assetRef
            $existsAtReference = Test-AssetByReference -AssetRoot $assetRoot -Reference $normalizedCurrent

            if ($existsAtReference) {
                return $m.Value
            }

            $resolveResult = Find-AssetRelativePath -AssetRoot $assetRoot -Reference $normalizedCurrent
            $resolvedRef = $resolveResult.ResolvedRef

            if (-not $resolvedRef) {
                $line = Get-LineNumberFromIndex -Text $updatedText -Index $m.Index
                $warningKey = "asset|$($file.Name)|$code|$assetType|$line|$($assetRef.ToLowerInvariant())"
                $warningMessage = "WARNING: Missing {0} asset '{1}' (code {2}) in '{3}' at line {4}" -f $assetType, $assetRef, $code, $file.Name, $line
                Write-DedupWarning -Key $warningKey -Message $warningMessage
                return $m.Value
            }

            if ($resolveResult.DuplicateRelativePaths.Count -gt 0) {
                $line = Get-LineNumberFromIndex -Text $updatedText -Index $m.Index
                $otherPaths = $resolveResult.DuplicateRelativePaths -join ', '
                $warningKey = "dup|$($file.Name)|$code|$assetType|$line|$($assetRef.ToLowerInvariant())|$($resolvedRef.ToLowerInvariant())|$($otherPaths.ToLowerInvariant())"
                $warningMessage = "WARNING: Duplicate {0} asset name '{1}' found while resolving (code {2}) in '{3}' at line {4}. Using '{5}'. Other matches: {6}" -f $assetType, $assetRef, $code, $file.Name, $line, $resolvedRef, $otherPaths
                Write-DedupWarning -Key $warningKey -Message $warningMessage
            }

            if ($resolvedRef -ieq $normalizedCurrent) {
                return $m.Value
            }

            $encoded = Encode-JsonString $resolvedRef

            $prefixLen = $m.Groups['asset'].Index - $m.Index
            $suffixStart = $prefixLen + $m.Groups['asset'].Length
            $newValue = $m.Value.Substring(0, $prefixLen) + $encoded + $m.Value.Substring($suffixStart)

            $fileFixes++
            $script:totalFixes++
            return $newValue
        })
    }

    foreach ($entry in $animationIdPatterns) {
        $code = [int]$entry.Code
        $regex = [regex]::new($entry.Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        $matches = $regex.Matches($updatedText)

        foreach ($m in $matches) {
            $animId = [int]$m.Groups['animId'].Value
            if (Test-AnimationIdExists -AnimationId $animId -AnimationIdSet $animationIdSet) {
                continue
            }

            $line = Get-LineNumberFromIndex -Text $updatedText -Index $m.Index
            $warningKey = "anim|$($file.Name)|$code|$line|$animId"
            $warningMessage = "WARNING: Missing animation ID '{0}' (code {1}) in '{2}' at line {3}" -f $animId, $code, $file.Name, $line
            Write-DedupWarning -Key $warningKey -Message $warningMessage
        }
    }

    if ($updatedText -cne $originalText) {
        Set-Content -LiteralPath $file.FullName -Value $updatedText -Encoding UTF8
        $script:changedFiles++
        Write-Host ("Updated: {0} ({1} fix(es))" -f $file.Name, $fileFixes)
    }
}

Write-Host ''
Write-Host 'Done.'
Write-Host ("Engine: {0}" -f $Engine)
Write-Host ("JSON files scanned: {0}" -f $script:totalFiles)
Write-Host ("Files changed: {0}" -f $script:changedFiles)
Write-Host ("Path fixes applied: {0}" -f $script:totalFixes)
Write-Host ("Missing-asset warnings: {0}" -f $script:totalWarnings)
