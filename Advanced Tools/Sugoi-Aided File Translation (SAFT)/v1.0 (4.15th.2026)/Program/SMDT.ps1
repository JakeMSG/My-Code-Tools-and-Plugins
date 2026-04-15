param(
	[ValidateSet('Database', 'DragDrop', 'RestoreAssetNames')]
	[string]$Mode = 'Database',

	[ValidateSet('MV', 'MZ')]
	[string]$Engine,

	[string]$RootDir = $PSScriptRoot,
	[switch]$TranslateAssets,
	[string[]]$InputPaths,
	[string]$InputListFile,
	[string]$ApiUrl,
	[string]$UserSettingsFile = 'F:\Programs\SugoiTranslatorToolkit\Program\Code\User-Settings.json',
	[int]$TimeoutSec = 90
)

$ErrorActionPreference = 'Stop'

$script:japanesePresenceRegex = [regex]'[\p{IsHiragana}\p{IsKatakana}\p{IsCJKUnifiedIdeographs}\u3005\u303B\u30FC\uFF66-\uFF9F]'
$script:japaneseSegmentRegex = [regex]'(?:[\p{IsHiragana}\p{IsKatakana}\p{IsCJKUnifiedIdeographs}\u3005\u303B\u30FC\uFF66-\uFF9F])(?:[\p{IsHiragana}\p{IsKatakana}\p{IsCJKUnifiedIdeographs}\u3005\u303B\u30FC\uFF66-\uFF9F0-9\s\u3000-\u303F\uFF00-\uFF65!?,\.:;\/\\%&+\=\-\u2010\u2013\u2014])*'

$script:translationCache = @{}
$script:translationRequests = 0
$script:translatedSegments = 0
$script:activeApiBase = $null
$script:activeTimeoutSec = $TimeoutSec
$script:assetReferenceTranslationMap = @{}
$script:assetReferenceDetectionCache = @{}
$script:pluginReferenceSet = @{}
$script:pluginProtectedAssetWarningMap = @{}

$script:assetCommandTargetMap = @{
	101 = @([pscustomobject]@{ AssetType = 'Face'; Index = 0; FieldName = $null })
	132 = @([pscustomobject]@{ AssetType = 'Bgm'; Index = 0; FieldName = 'name' })
	133 = @([pscustomobject]@{ AssetType = 'Me'; Index = 0; FieldName = 'name' })
	139 = @([pscustomobject]@{ AssetType = 'Me'; Index = 0; FieldName = 'name' })
	140 = @([pscustomobject]@{ AssetType = 'Bgm'; Index = 1; FieldName = 'name' })
	231 = @([pscustomobject]@{ AssetType = 'Picture'; Index = 1; FieldName = $null })
	241 = @([pscustomobject]@{ AssetType = 'Bgm'; Index = 0; FieldName = 'name' })
	245 = @([pscustomobject]@{ AssetType = 'Bgs'; Index = 0; FieldName = 'name' })
	249 = @([pscustomobject]@{ AssetType = 'Me'; Index = 0; FieldName = 'name' })
	250 = @([pscustomobject]@{ AssetType = 'Se'; Index = 0; FieldName = 'name' })
	261 = @([pscustomobject]@{ AssetType = 'Movie'; Index = 0; FieldName = $null })
	283 = @(
		[pscustomobject]@{ AssetType = 'Battleback1'; Index = 0; FieldName = $null },
		[pscustomobject]@{ AssetType = 'Battleback2'; Index = 1; FieldName = $null }
	)
	284 = @([pscustomobject]@{ AssetType = 'Parallax'; Index = 0; FieldName = $null })
	322 = @(
		[pscustomobject]@{ AssetType = 'Character'; Index = 1; FieldName = $null },
		[pscustomobject]@{ AssetType = 'Face'; Index = 3; FieldName = $null },
		[pscustomobject]@{ AssetType = 'SvActor'; Index = 5; FieldName = $null }
	)
	323 = @([pscustomobject]@{ AssetType = 'Character'; Index = 1; FieldName = $null })
}

function Resolve-TranslationApiUrl {
	param(
		[string]$ExplicitApiUrl,
		[string]$SettingsPath
	)

	if (-not [string]::IsNullOrWhiteSpace($ExplicitApiUrl)) {
		return $ExplicitApiUrl.TrimEnd('/')
	}

	if (Test-Path -LiteralPath $SettingsPath) {
		try {
			$settings = Get-Content -LiteralPath $SettingsPath -Raw | ConvertFrom-Json
			$currentTranslator = [string]$settings.Translation_API_Server.current_translator
			if (-not [string]::IsNullOrWhiteSpace($currentTranslator)) {
				$translatorNode = $settings.Translation_API_Server.$currentTranslator
				if ($null -ne $translatorNode -and $null -ne $translatorNode.HTTP_port_number) {
					$port = [int]$translatorNode.HTTP_port_number
					return "http://127.0.0.1:$port"
				}
			}
		} catch {
			Write-Warning "Could not read Translation_API_Server settings from '$SettingsPath'. Falling back to default port 14366."
		}
	} else {
		Write-Warning "Settings file not found at '$SettingsPath'. Falling back to default port 14366."
	}

	return 'http://127.0.0.1:14366'
}

function Invoke-SugoiApi {
	param(
		[string]$BaseUrl,
		[string]$Message,
		[object]$Content,
		[int]$RequestTimeoutSec
	)

	$payload = @{
		message = $Message
		content = $Content
	} | ConvertTo-Json -Compress -Depth 10

	return Invoke-RestMethod -Method Post -Uri ($BaseUrl.TrimEnd('/') + '/') -ContentType 'application/json; charset=utf-8' -Body $payload -TimeoutSec $RequestTimeoutSec
}

function Confirm-ServerReady {
	param(
		[string]$BaseUrl,
		[int]$RequestTimeoutSec
	)

	try {
		$readyResult = Invoke-SugoiApi -BaseUrl $BaseUrl -Message 'check if server is ready' -Content 'no content' -RequestTimeoutSec $RequestTimeoutSec
	} catch {
		throw "Could not contact Sugoi Translation API at '$BaseUrl'. Ensure the server is open first. Underlying error: $($_.Exception.Message)"
	}

	if ($readyResult -is [bool]) {
		if (-not $readyResult) {
			throw 'Sugoi Translation API responded, but reported not-ready status.'
		}
		return
	}

	if ($readyResult -is [string]) {
		$normalized = $readyResult.Trim('"').Trim().ToLowerInvariant()
		if ($normalized -in @('false', '0', 'not ready', 'not_ready')) {
			throw 'Sugoi Translation API responded, but reported not-ready status.'
		}
	}
}

function Initialize-TranslationSession {
	param(
		[string]$ExplicitApiUrl,
		[string]$SettingsPath,
		[int]$RequestTimeoutSec
	)

	$script:activeApiBase = Resolve-TranslationApiUrl -ExplicitApiUrl $ExplicitApiUrl -SettingsPath $SettingsPath
	$script:activeTimeoutSec = $RequestTimeoutSec
	Write-Host "Using translation API: $script:activeApiBase"
	Confirm-ServerReady -BaseUrl $script:activeApiBase -RequestTimeoutSec $RequestTimeoutSec
}

function Normalize-Ref {
	param([string]$Reference)

	if ([string]::IsNullOrWhiteSpace($Reference)) {
		return ''
	}

	$normalized = $Reference.Trim() -replace '\\', '/'
	$normalized = $normalized.TrimStart('./')
	return $normalized
}

function Get-AssetTranslationMapKey {
	param(
		[string]$AssetType,
		[string]$Reference
	)

	$assetTypePart = if ([string]::IsNullOrWhiteSpace($AssetType)) { '' } else { $AssetType.Trim().ToLowerInvariant() }
	$normalizedRef = (Normalize-Ref $Reference).ToLowerInvariant()
	return ($assetTypePart + '|' + $normalizedRef)
}

function ConvertTo-SafeAssetLeafName {
	param([string]$LeafName)

	if ([string]::IsNullOrWhiteSpace($LeafName)) {
		return ''
	}

	$safe = $LeafName -replace '[<>:"/\\|?*\x00-\x1F]', '_'
	$safe = $safe -replace '\s+', ' '
	$safe = $safe.Trim().TrimEnd('.')
	return $safe
}

function Decode-UriComponentSafe {
	param([string]$Value)

	if ($null -eq $Value) {
		return $null
	}

	try {
		return [System.Uri]::UnescapeDataString($Value)
	} catch {
		return $Value
	}
}

function Get-PathLeafSafe {
	param([string]$PathLike)

	if ([string]::IsNullOrWhiteSpace($PathLike)) {
		return ''
	}

	try {
		return [System.IO.Path]::GetFileName($PathLike)
	} catch {
		return ($PathLike -split '[\\/]' | Select-Object -Last 1)
	}
}

function Get-PathDirectorySafe {
	param([string]$PathLike)

	if ([string]::IsNullOrWhiteSpace($PathLike)) {
		return ''
	}

	try {
		return [System.IO.Path]::GetDirectoryName($PathLike)
	} catch {
		if ($PathLike -match '^(.*)[\\/][^\\/]*$') {
			return [string]$matches[1]
		}
		return ''
	}
}

function Test-IsLikelyAssetExtension {
	param([string]$Extension)

	if ([string]::IsNullOrWhiteSpace($Extension)) {
		return $false
	}

	return ($Extension -match '^\.[A-Za-z][A-Za-z0-9_]{0,9}$')
}

function Test-PathHasExtensionSafe {
	param([string]$PathLeaf)

	if ([string]::IsNullOrWhiteSpace($PathLeaf)) {
		return $false
	}

	$extension = Get-PathExtensionSafe -PathLeaf $PathLeaf
	return (Test-IsLikelyAssetExtension -Extension $extension)
}

function Get-PathLeafWithoutExtensionSafe {
	param([string]$PathLeaf)

	if ([string]::IsNullOrWhiteSpace($PathLeaf)) {
		return ''
	}

	try {
		return [System.IO.Path]::GetFileNameWithoutExtension($PathLeaf)
	} catch {
		$lastDot = $PathLeaf.LastIndexOf('.')
		if ($lastDot -gt 0) {
			return $PathLeaf.Substring(0, $lastDot)
		}
		return $PathLeaf
	}
}

function Get-PathExtensionSafe {
	param([string]$PathLeaf)

	if ([string]::IsNullOrWhiteSpace($PathLeaf)) {
		return ''
	}

	try {
		return [System.IO.Path]::GetExtension($PathLeaf)
	} catch {
		$lastDot = $PathLeaf.LastIndexOf('.')
		if ($lastDot -gt 0 -and $lastDot -lt ($PathLeaf.Length - 1)) {
			return $PathLeaf.Substring($lastDot)
		}
		return ''
	}
}

function Normalize-AssetReferencePath {
	param([string]$ReferenceNorm)

	if ([string]::IsNullOrWhiteSpace($ReferenceNorm)) {
		return ''
	}

	$segments = @($ReferenceNorm -split '/')
	if ($segments.Count -eq 0) {
		return Normalize-Ref $ReferenceNorm
	}

	$normalizedSegments = New-Object System.Collections.ArrayList
	for ($i = 0; $i -lt $segments.Count; $i++) {
		$segment = [string]$segments[$i]
		if ([string]::IsNullOrWhiteSpace($segment)) {
			continue
		}

		$decodedSegment = Decode-UriComponentSafe -Value $segment
		if ([string]::IsNullOrWhiteSpace($decodedSegment)) {
			continue
		}

		if ($i -eq ($segments.Count - 1)) {
			$hasExt = Test-PathHasExtensionSafe -PathLeaf $decodedSegment
			$baseName = if ($hasExt) { Get-PathLeafWithoutExtensionSafe -PathLeaf $decodedSegment } else { $decodedSegment }
			$extension = if ($hasExt) { Get-PathExtensionSafe -PathLeaf $decodedSegment } else { '' }

			$safeBaseName = ConvertTo-SafeAssetLeafName -LeafName $baseName
			if ([string]::IsNullOrWhiteSpace($safeBaseName)) {
				$safeBaseName = $baseName
			}

			$normalizedLeaf = if ($hasExt) { $safeBaseName + $extension } else { $safeBaseName }
			[void]$normalizedSegments.Add($normalizedLeaf)
		} else {
			$safeSegment = ConvertTo-SafeAssetLeafName -LeafName $decodedSegment
			if ([string]::IsNullOrWhiteSpace($safeSegment)) {
				$safeSegment = $decodedSegment
			}

			[void]$normalizedSegments.Add($safeSegment)
		}
	}

	if ($normalizedSegments.Count -eq 0) {
		return Normalize-Ref $ReferenceNorm
	}

	return Normalize-Ref ([string]::Join('/', @($normalizedSegments)))
}

function Build-TranslatedAssetReference {
	param([string]$OldNorm)

	if ([string]::IsNullOrWhiteSpace($OldNorm)) {
		return ''
	}

	$segments = @($OldNorm -split '/')
	if ($segments.Count -eq 0) {
		return Normalize-AssetReferencePath -ReferenceNorm $OldNorm
	}

	$translatedSegments = New-Object System.Collections.ArrayList
	for ($i = 0; $i -lt $segments.Count; $i++) {
		$segment = [string]$segments[$i]
		if ([string]::IsNullOrWhiteSpace($segment)) {
			continue
		}

		if ($i -eq ($segments.Count - 1)) {
			$hasExt = Test-PathHasExtensionSafe -PathLeaf $segment
			$baseName = if ($hasExt) { Get-PathLeafWithoutExtensionSafe -PathLeaf $segment } else { $segment }
			$extension = if ($hasExt) { Get-PathExtensionSafe -PathLeaf $segment } else { '' }

			$translatedBaseName = Translate-JapaneseSegments -Text $baseName
			if ([string]::IsNullOrWhiteSpace($translatedBaseName)) {
				$translatedBaseName = $baseName
			}

			$translatedLeaf = if ($hasExt) { $translatedBaseName + $extension } else { $translatedBaseName }
			[void]$translatedSegments.Add($translatedLeaf)
		} else {
			$translatedSegment = Translate-JapaneseSegments -Text $segment
			if ([string]::IsNullOrWhiteSpace($translatedSegment)) {
				$translatedSegment = $segment
			}

			[void]$translatedSegments.Add($translatedSegment)
		}
	}

	if ($translatedSegments.Count -eq 0) {
		return Normalize-AssetReferencePath -ReferenceNorm $OldNorm
	}

	$translatedNorm = [string]::Join('/', @($translatedSegments))
	return Normalize-AssetReferencePath -ReferenceNorm $translatedNorm
}

function Test-IsNonTranslatableMachineString {
	param([string]$Text)

	if ($null -eq $Text) {
		return $true
	}

	$trimmed = $Text.Trim()
	if ($trimmed.Length -eq 0) {
		return $true
	}

	$lower = $trimmed.ToLowerInvariant()
	if ($lower -in @('null', 'true', 'false', '[]', '{}')) {
		return $true
	}

	if (($trimmed.StartsWith('[') -and $trimmed.EndsWith(']')) -or ($trimmed.StartsWith('{') -and $trimmed.EndsWith('}'))) {
		try {
			$null = $trimmed | ConvertFrom-Json
			return $true
		} catch {
		}
	}

	return $false
}

function Read-AssetNamesBackupData {
	param([string]$BackupFilePath)

	if (-not (Test-Path -LiteralPath $BackupFilePath)) {
		return $null
	}

	try {
		return Get-Content -LiteralPath $BackupFilePath -Raw -Encoding UTF8 | ConvertFrom-Json
	} catch {
		Write-Host ("WARNING: Could not parse existing asset backup file '{0}'. Error: {1}" -f $BackupFilePath, $_.Exception.Message)
		return $null
	}
}

function Initialize-AssetReferenceTranslationMap {
	param([string]$BackupRoot)

	$script:assetReferenceTranslationMap = @{}
	$backupFilePath = Join-Path $BackupRoot 'AssetNamesBackup.json'
	$backupData = Read-AssetNamesBackupData -BackupFilePath $backupFilePath
	if ($null -eq $backupData -or $null -eq $backupData.CommandReferenceEntries) {
		return 0
	}

	$loaded = 0
	foreach ($entry in @($backupData.CommandReferenceEntries)) {
		if ($null -eq $entry) {
			continue
		}

		$assetType = [string]$entry.AssetType
		$oldRef = Normalize-Ref ([string]$entry.OldRef)
		$newRef = Normalize-Ref ([string]$entry.NewRef)
		if ([string]::IsNullOrWhiteSpace($assetType) -or [string]::IsNullOrWhiteSpace($oldRef) -or [string]::IsNullOrWhiteSpace($newRef)) {
			continue
		}

		$key = Get-AssetTranslationMapKey -AssetType $assetType -Reference $oldRef
		$script:assetReferenceTranslationMap[$key] = $newRef
		$loaded++
	}

	return $loaded
}

function Add-PluginReferenceValue {
	param(
		[hashtable]$Target,
		[string]$Value
	)

	if ([string]::IsNullOrWhiteSpace($Value)) {
		return
	}

	$normalized = Normalize-Ref $Value
	if (-not [string]::IsNullOrWhiteSpace($normalized)) {
		$Target[$normalized.ToLowerInvariant()] = $true

		$leaf = $null
		try {
			$leaf = [System.IO.Path]::GetFileName($normalized)
		} catch {
			$leaf = ($normalized -split '[\\/]' | Select-Object -Last 1)
		}

		if (-not [string]::IsNullOrWhiteSpace($leaf)) {
			$Target[$leaf.ToLowerInvariant()] = $true

			$leafNoExt = $null
			try {
				$leafNoExt = [System.IO.Path]::GetFileNameWithoutExtension($leaf)
			} catch {
				$lastDot = $leaf.LastIndexOf('.')
				if ($lastDot -gt 0) {
					$leafNoExt = $leaf.Substring(0, $lastDot)
				}
			}

			if (-not [string]::IsNullOrWhiteSpace($leafNoExt)) {
				$Target[$leafNoExt.ToLowerInvariant()] = $true
			}
		}
	}
}

function Add-PluginReferenceValuesRecursive {
	param(
		[hashtable]$Target,
		[object]$Value,
		[int]$Depth = 0
	)

	if ($Depth -gt 12 -or $null -eq $Value) {
		return
	}

	if ($Value -is [string]) {
		$text = [string]$Value
		Add-PluginReferenceValue -Target $Target -Value $text

		$trimmed = $text.Trim()
		if ($trimmed.Length -gt 1 -and $trimmed.Length -le 500000) {
			$looksJson = ($trimmed.StartsWith('{') -and $trimmed.EndsWith('}')) -or ($trimmed.StartsWith('[') -and $trimmed.EndsWith(']'))
			if ($looksJson) {
				$nestedParsed = $null
				try {
					$nestedParsed = ConvertFrom-Json -InputObject $trimmed -ErrorAction Stop
				} catch {
				}

				if ($null -ne $nestedParsed) {
					Add-PluginReferenceValuesRecursive -Target $Target -Value $nestedParsed -Depth ($Depth + 1)
				}
			}
		}

		return
	}

	if ($Value -is [System.Collections.IDictionary]) {
		foreach ($dictKey in @($Value.Keys)) {
			Add-PluginReferenceValuesRecursive -Target $Target -Value $dictKey -Depth ($Depth + 1)
			Add-PluginReferenceValuesRecursive -Target $Target -Value $Value[$dictKey] -Depth ($Depth + 1)
		}
		return
	}

	if ($Value -is [System.Collections.IList]) {
		foreach ($item in @($Value)) {
			Add-PluginReferenceValuesRecursive -Target $Target -Value $item -Depth ($Depth + 1)
		}
		return
	}

	if ($Value -is [pscustomobject]) {
		foreach ($property in $Value.PSObject.Properties) {
			Add-PluginReferenceValuesRecursive -Target $Target -Value $property.Name -Depth ($Depth + 1)
			Add-PluginReferenceValuesRecursive -Target $Target -Value $property.Value -Depth ($Depth + 1)
		}
	}
}

function Initialize-PluginReferenceSet {
	param([string]$GameRootPath)

	$script:pluginReferenceSet = @{}
	$script:pluginProtectedAssetWarningMap = @{}

	$pluginsPath = Join-Path $GameRootPath 'js\plugins.js'
	if (-not (Test-Path -LiteralPath $pluginsPath)) {
		return 0
	}

	$raw = $null
	try {
		$raw = Get-Content -LiteralPath $pluginsPath -Raw -Encoding UTF8
	} catch {
		Write-Host ("WARNING: Could not read plugin settings file '{0}'." -f $pluginsPath)
		return 0
	}

	$regex = [regex]'"((?:\\.|[^"\\])*)"'
	$matches = $regex.Matches($raw)
	foreach ($match in $matches) {
		$captured = $match.Groups[1].Value
		if ([string]::IsNullOrWhiteSpace($captured)) {
			continue
		}

		$decoded = $captured
		try {
			$decoded = ConvertFrom-Json -InputObject ('"' + $captured + '"')
		} catch {
		}

		Add-PluginReferenceValuesRecursive -Target $script:pluginReferenceSet -Value $decoded
	}

	return $script:pluginReferenceSet.Count
}

function Test-IsAssetReferenceProtectedByPlugin {
	param([string]$AssetReference)

	if ($null -eq $script:pluginReferenceSet -or $script:pluginReferenceSet.Count -eq 0) {
		return $false
	}

	$normalized = Normalize-Ref $AssetReference
	if ([string]::IsNullOrWhiteSpace($normalized)) {
		return $false
	}

	$key = $normalized.ToLowerInvariant()
	if ($script:pluginReferenceSet.ContainsKey($key)) {
		return $true
	}

	$leaf = $null
	try {
		$leaf = [System.IO.Path]::GetFileName($normalized)
	} catch {
		$leaf = ($normalized -split '[\\/]' | Select-Object -Last 1)
	}

	if (-not [string]::IsNullOrWhiteSpace($leaf) -and $script:pluginReferenceSet.ContainsKey($leaf.ToLowerInvariant())) {
		return $true
	}

	$leafNoExt = $null
	if (-not [string]::IsNullOrWhiteSpace($leaf)) {
		try {
			$leafNoExt = [System.IO.Path]::GetFileNameWithoutExtension($leaf)
		} catch {
			$lastDot = $leaf.LastIndexOf('.')
			if ($lastDot -gt 0) {
				$leafNoExt = $leaf.Substring(0, $lastDot)
			}
		}
	}

	if (-not [string]::IsNullOrWhiteSpace($leafNoExt) -and $script:pluginReferenceSet.ContainsKey($leafNoExt.ToLowerInvariant())) {
		return $true
	}

	return $false
}

function Get-ConsistentAssetReferenceTranslation {
	param(
		[string]$AssetType,
		[string]$OldReference
	)

	$oldNorm = Normalize-Ref $OldReference
	if ([string]::IsNullOrWhiteSpace($oldNorm)) {
		return $OldReference
	}

	$mapKey = Get-AssetTranslationMapKey -AssetType $AssetType -Reference $oldNorm
	if ($script:assetReferenceTranslationMap.ContainsKey($mapKey)) {
		$mappedNorm = Normalize-AssetReferencePath -ReferenceNorm ([string]$script:assetReferenceTranslationMap[$mapKey])
		if ([string]::IsNullOrWhiteSpace($mappedNorm)) {
			$mappedNorm = $oldNorm
		}

		$script:assetReferenceTranslationMap[$mapKey] = $mappedNorm
		if ($OldReference -like '*\*' -and $OldReference -notlike '*/*') {
			return $mappedNorm -replace '/', '\\'
		}
		return $mappedNorm
	}

	$newNorm = Build-TranslatedAssetReference -OldNorm $oldNorm
	if ([string]::IsNullOrWhiteSpace($newNorm)) {
		$newNorm = $oldNorm
	}

	$script:assetReferenceTranslationMap[$mapKey] = $newNorm

	if ($OldReference -like '*\*' -and $OldReference -notlike '*/*') {
		return $newNorm -replace '/', '\\'
	}

	return $newNorm
}

function Get-RelativePathSafe {
	param(
		[string]$BasePath,
		[string]$TargetPath
	)

	$baseFull = [System.IO.Path]::GetFullPath($BasePath).TrimEnd('\\')
	$targetFull = [System.IO.Path]::GetFullPath($TargetPath)

	if ($targetFull.StartsWith($baseFull, [System.StringComparison]::OrdinalIgnoreCase)) {
		$directRelative = $targetFull.Substring($baseFull.Length).TrimStart('\\')
		if (-not [string]::IsNullOrWhiteSpace($directRelative)) {
			return $directRelative
		}
	}

	$baseUri = [System.Uri]($baseFull + '\\')
	$targetUri = [System.Uri]$targetFull

	$relative = [System.Uri]::UnescapeDataString($baseUri.MakeRelativeUri($targetUri).ToString())
	return $relative.Replace('/', '\\')
}

function Test-IsLikelyTextFile {
	param([string]$Path)

	try {
		$stream = [System.IO.File]::OpenRead($Path)
		try {
			$length = [Math]::Min(4096, [int]$stream.Length)
			$buffer = New-Object byte[] $length
			[void]$stream.Read($buffer, 0, $length)

			foreach ($byte in $buffer) {
				if ($byte -eq 0) {
					return $false
				}
			}

			return $true
		} finally {
			$stream.Close()
		}
	} catch {
		return $false
	}
}

function Read-TextFile {
	param([string]$Path)

	try {
		$stream = [System.IO.File]::OpenRead($Path)
		try {
			$reader = New-Object System.IO.StreamReader($stream, $true)
			$text = $reader.ReadToEnd()
			$encoding = $reader.CurrentEncoding
			$reader.Close()

			return [pscustomobject]@{
				Text = $text
				Encoding = $encoding
			}
		} finally {
			$stream.Close()
		}
	} catch {
		return $null
	}
}

function Write-TextFile {
	param(
		[string]$Path,
		[string]$Text,
		[System.Text.Encoding]$Encoding
	)

	$writer = New-Object System.IO.StreamWriter($Path, $false, $Encoding)
	try {
		$writer.Write($Text)
	} finally {
		$writer.Dispose()
	}
}

function Get-ObjectPropertyValue {
	param(
		[object]$Object,
		[string]$Name
	)

	if ($null -eq $Object) {
		return $null
	}

	if ($Object -is [System.Collections.IDictionary]) {
		if ($Object.Contains($Name)) {
			return $Object[$Name]
		}
		return $null
	}

	$property = $Object.PSObject.Properties[$Name]
	if ($null -eq $property) {
		return $null
	}

	return $property.Value
}

function Set-ObjectPropertyValue {
	param(
		[object]$Object,
		[string]$Name,
		[object]$Value
	)

	if ($Object -is [System.Collections.IDictionary]) {
		$Object[$Name] = $Value
		return
	}

	$Object.$Name = $Value
}

function Get-AssetTargetsForCode {
	param([int]$Code)

	if ($script:assetCommandTargetMap.ContainsKey($Code)) {
		return $script:assetCommandTargetMap[$Code]
	}

	return @()
}

function Translate-Segment {
	param([string]$Segment)

	if ([string]::IsNullOrWhiteSpace($Segment)) {
		return $Segment
	}

	if ($script:translationCache.ContainsKey($Segment)) {
		return $script:translationCache[$Segment]
	}

	$translation = Invoke-SugoiApi -BaseUrl $script:activeApiBase -Message 'translate sentences' -Content $Segment -RequestTimeoutSec $script:activeTimeoutSec
	$script:translationRequests++

	if ($null -eq $translation) {
		$translation = $Segment
	}

	if (-not ($translation -is [string])) {
		$translation = [string]$translation
	}

	$script:translationCache[$Segment] = $translation
	return $translation
}

function Translate-JapaneseSegments {
	param([string]$Text)

	if ([string]::IsNullOrEmpty($Text)) {
		return $Text
	}

	if (-not $script:japanesePresenceRegex.IsMatch($Text)) {
		return $Text
	}

	$translatedText = $script:japaneseSegmentRegex.Replace($Text, {
		param($match)

		$segment = $match.Value
		$translated = Translate-Segment -Segment $segment

		if ($translated -cne $segment) {
			$script:translatedSegments++
		}

		return $translated
	})

	return $translatedText
}

function Get-AssetRootsForEngine {
	param(
		[string]$ResolvedGameRoot,
		[string]$EngineValue
	)

	if ($EngineValue -ieq 'MV') {
		return @{
			Enemy = Join-Path $ResolvedGameRoot 'img/enemies'
			Picture = Join-Path $ResolvedGameRoot 'img/pictures'
			Animation = Join-Path $ResolvedGameRoot 'img/animations'
			Battleback1 = Join-Path $ResolvedGameRoot 'img/battlebacks1'
			Battleback2 = Join-Path $ResolvedGameRoot 'img/battlebacks2'
			Parallax = Join-Path $ResolvedGameRoot 'img/parallaxes'
			Character = Join-Path $ResolvedGameRoot 'img/characters'
			Face = Join-Path $ResolvedGameRoot 'img/faces'
			SvActor = Join-Path $ResolvedGameRoot 'img/sv_actors'
			Movie = Join-Path $ResolvedGameRoot 'movies'
			Bgm = Join-Path $ResolvedGameRoot 'audio/bgm'
			Bgs = Join-Path $ResolvedGameRoot 'audio/bgs'
			Me = Join-Path $ResolvedGameRoot 'audio/me'
			Se = Join-Path $ResolvedGameRoot 'audio/se'
		}
	}

	return @{
		Enemy = Join-Path $ResolvedGameRoot 'img/enemies'
		Picture = Join-Path $ResolvedGameRoot 'img/pictures'
		Animation = Join-Path $ResolvedGameRoot 'effects'
		Battleback1 = Join-Path $ResolvedGameRoot 'img/battlebacks1'
		Battleback2 = Join-Path $ResolvedGameRoot 'img/battlebacks2'
		Parallax = Join-Path $ResolvedGameRoot 'img/parallaxes'
		Character = Join-Path $ResolvedGameRoot 'img/characters'
		Face = Join-Path $ResolvedGameRoot 'img/faces'
		SvActor = Join-Path $ResolvedGameRoot 'img/sv_actors'
		Movie = Join-Path $ResolvedGameRoot 'movies'
		Bgm = Join-Path $ResolvedGameRoot 'audio/bgm'
		Bgs = Join-Path $ResolvedGameRoot 'audio/bgs'
		Me = Join-Path $ResolvedGameRoot 'audio/me'
		Se = Join-Path $ResolvedGameRoot 'audio/se'
	}
}

function Resolve-GameRootForEngine {
	param(
		[string]$EngineValue,
		[string]$BaseRoot
	)

	$resolvedBase = (Resolve-Path -LiteralPath $BaseRoot).Path
	$candidates = New-Object System.Collections.ArrayList

	[void]$candidates.Add($resolvedBase)
	[void]$candidates.Add((Join-Path $resolvedBase 'www'))

	if ($EngineValue -ieq 'MV') {
		[void]$candidates.Add((Join-Path $resolvedBase 'MV'))
		[void]$candidates.Add((Join-Path $resolvedBase 'MV\www'))
	} else {
		[void]$candidates.Add((Join-Path $resolvedBase 'MZ'))
	}

	$seen = @{}
	foreach ($candidate in $candidates) {
		if ([string]::IsNullOrWhiteSpace($candidate)) {
			continue
		}

		$fullCandidate = [System.IO.Path]::GetFullPath($candidate)
		$candidateKey = $fullCandidate.ToLowerInvariant()
		if ($seen.ContainsKey($candidateKey)) {
			continue
		}
		$seen[$candidateKey] = $true

		if (Test-Path -LiteralPath (Join-Path $fullCandidate 'data')) {
			return $fullCandidate
		}
	}

	throw "Could not locate a valid game root for engine '$EngineValue' under '$resolvedBase'."
}

function Backup-DataFolder {
	param([string]$ResolvedGameRoot)

	$dataRoot = Join-Path $ResolvedGameRoot 'data'
	if (-not (Test-Path -LiteralPath $dataRoot)) {
		throw "Data folder not found: $dataRoot"
	}

	$backupRoot = Join-Path $ResolvedGameRoot 'data - TRBackup'
	if (-not (Test-Path -LiteralPath $backupRoot)) {
		New-Item -ItemType Directory -Path $backupRoot | Out-Null
	}

	Copy-Item -Path (Join-Path $dataRoot '*') -Destination $backupRoot -Recurse -Force
	return $backupRoot
}

function Get-AssetReferenceFromParameters {
	param(
		[System.Collections.IList]$Parameters,
		[object]$Target
	)

	$index = [int]$Target.Index
	if ($index -lt 0 -or $index -ge $Parameters.Count) {
		return $null
	}

	$fieldName = $Target.FieldName
	if ([string]::IsNullOrWhiteSpace($fieldName)) {
		$value = $Parameters[$index]
		if ($value -is [string]) {
			return $value
		}
		return $null
	}

	$container = $Parameters[$index]
	if ($null -eq $container) {
		return $null
	}

	$value = Get-ObjectPropertyValue -Object $container -Name $fieldName
	if ($value -is [string]) {
		return $value
	}

	return $null
}

function Set-AssetReferenceInParameters {
	param(
		[System.Collections.IList]$Parameters,
		[object]$Target,
		[string]$NewValue
	)

	$index = [int]$Target.Index
	if ($index -lt 0 -or $index -ge $Parameters.Count) {
		return
	}

	$fieldName = $Target.FieldName
	if ([string]::IsNullOrWhiteSpace($fieldName)) {
		$Parameters[$index] = $NewValue
		return
	}

	$container = $Parameters[$index]
	if ($null -eq $container) {
		return
	}

	Set-ObjectPropertyValue -Object $container -Name $fieldName -Value $NewValue
	$Parameters[$index] = $container
}

function Rename-AssetReferenceFiles {
	param(
		[string]$AssetType,
		[string]$OldReference,
		[string]$NewReference
	)

	$oldNorm = Normalize-Ref $OldReference
	$newNorm = Normalize-Ref $NewReference
	if ([string]::IsNullOrWhiteSpace($oldNorm) -or [string]::IsNullOrWhiteSpace($newNorm)) {
		return $false
	}

	if ($oldNorm.ToLowerInvariant() -eq $newNorm.ToLowerInvariant()) {
		return $true
	}

	if (-not $script:dbAssetRoots.ContainsKey($AssetType)) {
		Write-Host ("WARNING: Unknown asset type '{0}' while renaming '{1}'." -f $AssetType, $oldNorm)
		return $false
	}

	$assetRoot = $script:dbAssetRoots[$AssetType]
	if (-not (Test-Path -LiteralPath $assetRoot)) {
		return $false
	}

	$oldLeaf = Get-PathLeafSafe -PathLike $oldNorm
	$oldDirPart = Get-PathDirectorySafe -PathLike $oldNorm
	$oldDirFs = if ([string]::IsNullOrWhiteSpace($oldDirPart)) { '' } else { $oldDirPart -replace '/', '\\' }
	$oldHasExt = Test-PathHasExtensionSafe -PathLeaf $oldLeaf
	$newLeaf = Get-PathLeafSafe -PathLike $newNorm
	$newDirPart = Get-PathDirectorySafe -PathLike $newNorm
	$newDirFs = if ([string]::IsNullOrWhiteSpace($newDirPart)) { '' } else { $newDirPart -replace '/', '\\' }

	$oldLeafCandidates = New-Object System.Collections.ArrayList
	if (-not [string]::IsNullOrWhiteSpace($oldLeaf)) {
		[void]$oldLeafCandidates.Add($oldLeaf)
	}

	$decodedOldLeaf = Decode-UriComponentSafe -Value $oldLeaf
	if (-not [string]::IsNullOrWhiteSpace($decodedOldLeaf) -and (-not ($oldLeafCandidates -contains $decodedOldLeaf))) {
		[void]$oldLeafCandidates.Add($decodedOldLeaf)
	}

	$oldDirCandidates = New-Object System.Collections.ArrayList
	[void]$oldDirCandidates.Add($oldDirFs)
	$decodedOldDirFs = if ([string]::IsNullOrWhiteSpace($oldDirFs)) { '' } else { Decode-UriComponentSafe -Value $oldDirFs }
	if (($decodedOldDirFs -ne $oldDirFs) -and (-not ($oldDirCandidates -contains $decodedOldDirFs))) {
		[void]$oldDirCandidates.Add($decodedOldDirFs)
	}

	$candidateFiles = New-Object System.Collections.ArrayList
	$candidateFileMap = @{}
	if ($oldHasExt) {
		foreach ($dirCandidate in $oldDirCandidates) {
			foreach ($leafCandidate in $oldLeafCandidates) {
				if ([string]::IsNullOrWhiteSpace($leafCandidate)) {
					continue
				}

				$oldRelativeFs = if ([string]::IsNullOrWhiteSpace($dirCandidate)) { $leafCandidate } else { Join-Path $dirCandidate $leafCandidate }
				$oldFull = Join-Path $assetRoot $oldRelativeFs
				if (-not (Test-Path -LiteralPath $oldFull -ErrorAction SilentlyContinue)) {
					continue
				}

				$item = Get-Item -LiteralPath $oldFull -ErrorAction SilentlyContinue
				if ($null -eq $item) {
					continue
				}

				$fileKey = $item.FullName.ToLowerInvariant()
				if (-not $candidateFileMap.ContainsKey($fileKey)) {
					[void]$candidateFiles.Add($item)
					$candidateFileMap[$fileKey] = $true
				}
			}
		}
	} else {
		$oldBaseCandidates = New-Object System.Collections.ArrayList
		foreach ($leafCandidate in $oldLeafCandidates) {
			if ([string]::IsNullOrWhiteSpace($leafCandidate)) {
				continue
			}

			$oldBaseCandidate = if (Test-PathHasExtensionSafe -PathLeaf $leafCandidate) {
				Get-PathLeafWithoutExtensionSafe -PathLeaf $leafCandidate
			} else {
				$leafCandidate
			}

			if (-not [string]::IsNullOrWhiteSpace($oldBaseCandidate) -and (-not ($oldBaseCandidates -contains $oldBaseCandidate))) {
				[void]$oldBaseCandidates.Add($oldBaseCandidate)
			}
		}

		foreach ($dirCandidate in $oldDirCandidates) {
			$baseDir = if ([string]::IsNullOrWhiteSpace($dirCandidate)) { $assetRoot } else { Join-Path $assetRoot $dirCandidate }
			if (-not (Test-Path -LiteralPath $baseDir -ErrorAction SilentlyContinue)) {
				continue
			}

			$dirFiles = Get-ChildItem -LiteralPath $baseDir -File -ErrorAction SilentlyContinue
			foreach ($dirFile in $dirFiles) {
				foreach ($oldBase in $oldBaseCandidates) {
					if ($dirFile.BaseName -ieq $oldBase) {
						$fileKey = $dirFile.FullName.ToLowerInvariant()
						if (-not $candidateFileMap.ContainsKey($fileKey)) {
							[void]$candidateFiles.Add($dirFile)
							$candidateFileMap[$fileKey] = $true
						}
						break
					}
				}
			}
		}
	}

	if (-not $candidateFiles -or $candidateFiles.Count -eq 0) {
		$targetBaseDir = if ([string]::IsNullOrWhiteSpace($newDirFs)) { $assetRoot } else { Join-Path $assetRoot $newDirFs }
		if (Test-Path -LiteralPath $targetBaseDir -ErrorAction SilentlyContinue) {
			$newHasExt = Test-PathHasExtensionSafe -PathLeaf $newLeaf
			if ($newHasExt) {
				$existingTarget = Join-Path $targetBaseDir $newLeaf
				if (Test-Path -LiteralPath $existingTarget -ErrorAction SilentlyContinue) {
					return $true
				}
			} else {
				$translatedMatch = Get-ChildItem -LiteralPath $targetBaseDir -File -ErrorAction SilentlyContinue |
					Where-Object { $_.BaseName -ieq $newLeaf } |
					Select-Object -First 1

				if ($null -ne $translatedMatch) {
					return $true
				}
			}
		}

		$missingWarningKey = ($AssetType.ToLowerInvariant() + '|' + $oldNorm.ToLowerInvariant() + '|' + $newNorm.ToLowerInvariant())
		if (-not $script:assetMissingSourceWarningMap.ContainsKey($missingWarningKey)) {
			Write-Host ("WARNING: Could not locate source asset files for reference '{0}' ({1})." -f $oldNorm, $AssetType)
			$script:assetMissingSourceWarningMap[$missingWarningKey] = $true
		}
		return $false
	}

	$renameResolved = $false

	foreach ($candidate in $candidateFiles) {
		$sourceFull = $candidate.FullName
		$targetDir = if ([string]::IsNullOrWhiteSpace($newDirFs)) { $assetRoot } else { Join-Path $assetRoot $newDirFs }

		$targetLeaf = $newLeaf
		if ($oldHasExt) {
			if (-not (Test-PathHasExtensionSafe -PathLeaf $targetLeaf)) {
				$targetLeaf = $targetLeaf + $candidate.Extension
			}
		} else {
			if (Test-PathHasExtensionSafe -PathLeaf $targetLeaf) {
				$targetLeaf = Get-PathLeafWithoutExtensionSafe -PathLeaf $targetLeaf
			}
			$targetLeaf = $targetLeaf + $candidate.Extension
		}

		if ([string]::IsNullOrWhiteSpace($targetLeaf)) {
			continue
		}

		if (-not (Test-Path -LiteralPath $targetDir)) {
			New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
		}

		$targetFull = Join-Path $targetDir $targetLeaf
		$operationKey = ($sourceFull.ToLowerInvariant() + '|' + $targetFull.ToLowerInvariant())
		if ($script:assetRenameOperationMap.ContainsKey($operationKey)) {
			$renameResolved = $true
			continue
		}

		if ($sourceFull.ToLowerInvariant() -eq $targetFull.ToLowerInvariant()) {
			$script:assetRenameOperationMap[$operationKey] = $true
			$renameResolved = $true
			continue
		}

		if ((-not (Test-Path -LiteralPath $sourceFull)) -and (Test-Path -LiteralPath $targetFull)) {
			$script:assetRenameOperationMap[$operationKey] = $true
			$renameResolved = $true
			continue
		}

		if (Test-Path -LiteralPath $targetFull) {
			if (-not $script:assetTargetExistsWarningMap.ContainsKey($operationKey)) {
				Write-Host ("WARNING: Cannot rename asset '{0}' to '{1}' because target already exists." -f $sourceFull, $targetFull)
				$script:assetTargetExistsWarningMap[$operationKey] = $true
			}
			$script:assetRenameOperationMap[$operationKey] = $true
			$renameResolved = $true
			continue
		}

		$oldRelativePath = Get-RelativePathSafe -BasePath $script:dbGameRoot -TargetPath $sourceFull
		$newRelativePath = Get-RelativePathSafe -BasePath $script:dbGameRoot -TargetPath $targetFull

		Move-Item -LiteralPath $sourceFull -Destination $targetFull
		$script:assetRenameOperationMap[$operationKey] = $true
		$script:dbAssetsRenamed++
		$renameResolved = $true

		$backupKey = ($oldRelativePath.ToLowerInvariant() + '|' + $newRelativePath.ToLowerInvariant())
		if (-not $script:assetRenameBackupMap.ContainsKey($backupKey)) {
			$entry = [pscustomobject]@{
				AssetType = $AssetType
				OldRelativePath = $oldRelativePath
				NewRelativePath = $newRelativePath
			}
			[void]$script:assetRenameBackupEntries.Add($entry)
			$script:assetRenameBackupMap[$backupKey] = $true
		}
	}

	return $renameResolved
}

function Test-IsKnownAssetReferenceValue {
	param([string]$Value)

	if ($null -eq $script:dbAssetRoots -or $script:dbAssetRoots.Count -eq 0) {
		return $false
	}

	if ([string]::IsNullOrWhiteSpace($Value)) {
		return $false
	}

	$normalized = Normalize-Ref $Value
	if ([string]::IsNullOrWhiteSpace($normalized)) {
		return $false
	}

	$cacheKey = $normalized.ToLowerInvariant()
	if ($script:assetReferenceDetectionCache.ContainsKey($cacheKey)) {
		return [bool]$script:assetReferenceDetectionCache[$cacheKey]
	}

	$leaf = $null
	try {
		$leaf = [System.IO.Path]::GetFileName($normalized)
	} catch {
		$leaf = ($normalized -split '[\\/]' | Select-Object -Last 1)
	}

	if ([string]::IsNullOrWhiteSpace($leaf)) {
		$script:assetReferenceDetectionCache[$cacheKey] = $false
		return $false
	}

	$dirPart = $null
	try {
		$dirPart = [System.IO.Path]::GetDirectoryName($normalized)
	} catch {
		$dirPart = ''
	}

	$dirFs = if ([string]::IsNullOrWhiteSpace($dirPart)) { '' } else { $dirPart -replace '/', '\\' }
	$hasExt = Test-PathHasExtensionSafe -PathLeaf $leaf

	foreach ($assetRoot in $script:dbAssetRoots.Values) {
		if (-not (Test-Path -LiteralPath $assetRoot -ErrorAction SilentlyContinue)) {
			continue
		}

		$baseDir = if ([string]::IsNullOrWhiteSpace($dirFs)) { $assetRoot } else { Join-Path $assetRoot $dirFs }
		if (-not (Test-Path -LiteralPath $baseDir -ErrorAction SilentlyContinue)) {
			continue
		}

		if ($hasExt) {
			$candidate = Join-Path $baseDir $leaf
			if (Test-Path -LiteralPath $candidate -ErrorAction SilentlyContinue) {
				$script:assetReferenceDetectionCache[$cacheKey] = $true
				return $true
			}
		} else {
			$matched = Get-ChildItem -LiteralPath $baseDir -File -ErrorAction SilentlyContinue |
				Where-Object { $_.BaseName -ieq $leaf } |
				Select-Object -First 1

			if ($null -ne $matched) {
				$script:assetReferenceDetectionCache[$cacheKey] = $true
				return $true
			}
		}
	}

	$script:assetReferenceDetectionCache[$cacheKey] = $false
	return $false
}

function Test-IsResolvableAssetReference {
	param(
		[string]$AssetType,
		[string]$Reference
	)

	if ([string]::IsNullOrWhiteSpace($AssetType) -or [string]::IsNullOrWhiteSpace($Reference)) {
		return $false
	}

	if ($null -eq $script:dbAssetRoots -or (-not $script:dbAssetRoots.ContainsKey($AssetType))) {
		return $false
	}

	$assetRoot = $script:dbAssetRoots[$AssetType]
	if (-not (Test-Path -LiteralPath $assetRoot -ErrorAction SilentlyContinue)) {
		return $false
	}

	$normalized = Normalize-Ref $Reference
	if ([string]::IsNullOrWhiteSpace($normalized)) {
		return $false
	}

	$leaf = Get-PathLeafSafe -PathLike $normalized
	if ([string]::IsNullOrWhiteSpace($leaf)) {
		return $false
	}

	$dirPart = Get-PathDirectorySafe -PathLike $normalized
	$dirFs = if ([string]::IsNullOrWhiteSpace($dirPart)) { '' } else { $dirPart -replace '/', '\\' }

	$leafCandidates = New-Object System.Collections.ArrayList
	[void]$leafCandidates.Add($leaf)
	$decodedLeaf = Decode-UriComponentSafe -Value $leaf
	if (-not [string]::IsNullOrWhiteSpace($decodedLeaf) -and (-not ($leafCandidates -contains $decodedLeaf))) {
		[void]$leafCandidates.Add($decodedLeaf)
	}

	$dirCandidates = New-Object System.Collections.ArrayList
	[void]$dirCandidates.Add($dirFs)
	$decodedDirFs = if ([string]::IsNullOrWhiteSpace($dirFs)) { '' } else { Decode-UriComponentSafe -Value $dirFs }
	if (($decodedDirFs -ne $dirFs) -and (-not ($dirCandidates -contains $decodedDirFs))) {
		[void]$dirCandidates.Add($decodedDirFs)
	}

	foreach ($dirCandidate in $dirCandidates) {
		$baseDir = if ([string]::IsNullOrWhiteSpace($dirCandidate)) { $assetRoot } else { Join-Path $assetRoot $dirCandidate }
		if (-not (Test-Path -LiteralPath $baseDir -ErrorAction SilentlyContinue)) {
			continue
		}

		foreach ($leafCandidate in $leafCandidates) {
			if ([string]::IsNullOrWhiteSpace($leafCandidate)) {
				continue
			}

			if (Test-PathHasExtensionSafe -PathLeaf $leafCandidate) {
				$candidatePath = Join-Path $baseDir $leafCandidate
				if (Test-Path -LiteralPath $candidatePath -ErrorAction SilentlyContinue) {
					return $true
				}
			} else {
				$matched = Get-ChildItem -LiteralPath $baseDir -File -ErrorAction SilentlyContinue |
					Where-Object { $_.BaseName -ieq $leafCandidate } |
					Select-Object -First 1

				if ($null -ne $matched) {
					return $true
				}
			}
		}
	}

	return $false
}

function Translate-DatabaseString {
	param([string]$InputText)

	if ([string]::IsNullOrEmpty($InputText)) {
		return $InputText
	}

	if (Test-IsNonTranslatableMachineString -Text $InputText) {
		return $InputText
	}

	if (Test-IsKnownAssetReferenceValue -Value $InputText) {
		return $InputText
	}

	$translated = Translate-JapaneseSegments -Text $InputText
	if ($translated -cne $InputText) {
		$script:dbStringValuesChanged++
		$script:dbCurrentFileChanged = $true
	}

	return $translated
}

function Process-DatabaseNode {
	param([object]$Node)

	if ($null -eq $Node) {
		return
	}

	if ($Node -is [System.Collections.IList]) {
		for ($i = 0; $i -lt $Node.Count; $i++) {
			$value = $Node[$i]
			if ($value -is [string]) {
				$newValue = Translate-DatabaseString -InputText $value
				if ($newValue -cne $value) {
					$Node[$i] = $newValue
				}
			} else {
				Process-DatabaseNode -Node $value
			}
		}
		return
	}

	if ($Node -is [System.Collections.IDictionary]) {
		if (Process-EventCommandObject -CommandObject $Node) {
			return
		}

		foreach ($key in @($Node.Keys)) {
			$value = $Node[$key]
			if ($value -is [string]) {
				$newValue = Translate-DatabaseString -InputText $value
				if ($newValue -cne $value) {
					$Node[$key] = $newValue
				}
			} else {
				Process-DatabaseNode -Node $value
			}
		}
		return
	}

	if ($Node -is [pscustomobject]) {
		if (Process-EventCommandObject -CommandObject $Node) {
			return
		}

		foreach ($property in $Node.PSObject.Properties) {
			$value = $property.Value
			if ($value -is [string]) {
				$newValue = Translate-DatabaseString -InputText $value
				if ($newValue -cne $value) {
					$Node.$($property.Name) = $newValue
				}
			} else {
				Process-DatabaseNode -Node $value
			}
		}
	}
}

function Process-EventCommandObject {
	param([object]$CommandObject)

	$codeValue = Get-ObjectPropertyValue -Object $CommandObject -Name 'code'
	$parameters = Get-ObjectPropertyValue -Object $CommandObject -Name 'parameters'

	if ($null -eq $codeValue -or $null -eq $parameters) {
		return $false
	}

	if (-not ($parameters -is [System.Collections.IList])) {
		return $false
	}

	[int]$code = 0
	if (-not [int]::TryParse([string]$codeValue, [ref]$code)) {
		return $false
	}

	$targets = Get-AssetTargetsForCode -Code $code
	$skipIndices = @{}

	foreach ($target in $targets) {
		$index = [int]$target.Index
		$skipIndices[$index] = $true

		$oldReference = Get-AssetReferenceFromParameters -Parameters $parameters -Target $target
		if ([string]::IsNullOrWhiteSpace($oldReference)) {
			continue
		}

		if (-not $script:dbTranslateAssets) {
			continue
		}

		if (Test-IsAssetReferenceProtectedByPlugin -AssetReference $oldReference) {
			$warnKey = Get-AssetTranslationMapKey -AssetType $target.AssetType -Reference $oldReference
			if (-not $script:pluginProtectedAssetWarningMap.ContainsKey($warnKey)) {
				Write-Host ("WARNING: Skipping asset rename for plugin-linked reference '{0}' ({1}) to prevent plugin load errors." -f $oldReference, $target.AssetType)
				$script:pluginProtectedAssetWarningMap[$warnKey] = $true
			}
			$script:dbAssetReferencesSkippedProtected++
			continue
		}

		$newReference = Get-ConsistentAssetReferenceTranslation -AssetType $target.AssetType -OldReference $oldReference
		$oldNorm = Normalize-Ref $oldReference
		$newNorm = Normalize-Ref $newReference
		if ($newNorm.ToLowerInvariant() -ne $oldNorm.ToLowerInvariant()) {
			$renameResolved = Rename-AssetReferenceFiles -AssetType $target.AssetType -OldReference $oldReference -NewReference $newReference
			if (-not $renameResolved) {
				$renameFailureKey = ($target.AssetType.ToLowerInvariant() + '|' + $oldNorm.ToLowerInvariant() + '|' + $newNorm.ToLowerInvariant())
				if (-not $script:assetRenameFailureWarningMap.ContainsKey($renameFailureKey)) {
					Write-Host ("WARNING: Keeping database reference '{0}' unchanged because matching asset rename could not be confirmed ({1})." -f $oldReference, $target.AssetType)
					$script:assetRenameFailureWarningMap[$renameFailureKey] = $true
				}
				continue
			}

			if (-not (Test-IsResolvableAssetReference -AssetType $target.AssetType -Reference $newReference)) {
				$unresolvedTargetKey = ($target.AssetType.ToLowerInvariant() + '|' + $newNorm.ToLowerInvariant())
				if (-not $script:assetUnresolvedTargetWarningMap.ContainsKey($unresolvedTargetKey)) {
					Write-Host ("WARNING: Keeping database reference '{0}' unchanged because new reference '{1}' is not resolvable on disk ({2})." -f $oldReference, $newReference, $target.AssetType)
					$script:assetUnresolvedTargetWarningMap[$unresolvedTargetKey] = $true
				}
				$script:dbAssetReferencesUnresolved++
				continue
			}

			Set-AssetReferenceInParameters -Parameters $parameters -Target $target -NewValue $newReference
			$script:dbCurrentFileChanged = $true
			$script:dbAssetReferenceChanges++

			$commandKey = ($target.AssetType.ToLowerInvariant() + '|' + $oldNorm.ToLowerInvariant() + '|' + $newNorm.ToLowerInvariant())
			if (-not $script:assetCommandBackupMap.ContainsKey($commandKey)) {
				$entry = [pscustomobject]@{
					AssetType = $target.AssetType
					OldRef = $oldNorm
					NewRef = $newNorm
				}
				[void]$script:assetCommandBackupEntries.Add($entry)
				$script:assetCommandBackupMap[$commandKey] = $true
			}
		}
	}

	for ($i = 0; $i -lt $parameters.Count; $i++) {
		if ($skipIndices.ContainsKey($i)) {
			continue
		}

		$value = $parameters[$i]
		if ($value -is [string]) {
			$newValue = Translate-DatabaseString -InputText $value
			if ($newValue -cne $value) {
				$parameters[$i] = $newValue
			}
		} else {
			Process-DatabaseNode -Node $value
		}
	}

	if ($CommandObject -is [System.Collections.IDictionary]) {
		foreach ($key in @($CommandObject.Keys)) {
			if ($key -in @('code', 'parameters')) {
				continue
			}

			$value = $CommandObject[$key]
			if ($value -is [string]) {
				$newValue = Translate-DatabaseString -InputText $value
				if ($newValue -cne $value) {
					$CommandObject[$key] = $newValue
				}
			} else {
				Process-DatabaseNode -Node $value
			}
		}
	} else {
		foreach ($property in $CommandObject.PSObject.Properties) {
			if ($property.Name -in @('code', 'parameters')) {
				continue
			}

			$value = $property.Value
			if ($value -is [string]) {
				$newValue = Translate-DatabaseString -InputText $value
				if ($newValue -cne $value) {
					$CommandObject.$($property.Name) = $newValue
				}
			} else {
				Process-DatabaseNode -Node $value
			}
		}
	}

	Set-ObjectPropertyValue -Object $CommandObject -Name 'parameters' -Value $parameters

	return $true
}

function Process-DatabaseJsonFile {
	param([string]$FilePath)

	try {
		$raw = Get-Content -LiteralPath $FilePath -Raw -Encoding UTF8
		$trimmedRaw = $raw.Trim()
		$expectsTopLevelArray = $trimmedRaw.StartsWith('[') -and $trimmedRaw.EndsWith(']')
		$jsonObject = ConvertFrom-Json -InputObject $raw
		if ($expectsTopLevelArray -and -not ($jsonObject -is [System.Collections.IList])) {
			$jsonObject = @($jsonObject)
		}
	} catch {
		Write-Host ("WARNING: Could not parse JSON file '{0}'. Skipping. Error: {1}" -f $FilePath, $_.Exception.Message)
		return $false
	}

	$script:dbCurrentFileChanged = $false
	Process-DatabaseNode -Node $jsonObject

	if ($script:dbCurrentFileChanged) {
		$outputObject = $jsonObject
		if ($expectsTopLevelArray -and -not ($outputObject -is [System.Collections.IList])) {
			$outputObject = @($outputObject)
		}

		if ($expectsTopLevelArray) {
			$updatedJson = ConvertTo-Json -InputObject @($outputObject) -Depth 100 -Compress
		} else {
			$updatedJson = ConvertTo-Json -InputObject $outputObject -Depth 100 -Compress
		}
		Set-Content -LiteralPath $FilePath -Value $updatedJson -Encoding UTF8
		return $true
	}

	return $false
}

function Write-AssetNamesBackupFile {
	param(
		[string]$BackupRoot,
		[string]$EngineValue,
		[string]$GameRootPath
	)

	$backupFilePath = Join-Path $BackupRoot 'AssetNamesBackup.json'
	$existingBackupData = Read-AssetNamesBackupData -BackupFilePath $backupFilePath

	$mergedFileEntries = New-Object System.Collections.ArrayList
	$fileEntryMap = @{}
	$fileEntrySources = @()
	if ($null -ne $existingBackupData -and $null -ne $existingBackupData.FileRenameEntries) {
		$fileEntrySources += @($existingBackupData.FileRenameEntries)
	}
	$fileEntrySources += @($script:assetRenameBackupEntries)

	foreach ($entry in $fileEntrySources) {
		if ($null -eq $entry) {
			continue
		}

		$assetType = [string]$entry.AssetType
		$oldRelativePath = [string]$entry.OldRelativePath
		$newRelativePath = [string]$entry.NewRelativePath
		if ([string]::IsNullOrWhiteSpace($assetType) -or [string]::IsNullOrWhiteSpace($oldRelativePath) -or [string]::IsNullOrWhiteSpace($newRelativePath)) {
			continue
		}

		$entryKey = ($assetType.ToLowerInvariant() + '|' + $oldRelativePath.ToLowerInvariant() + '|' + $newRelativePath.ToLowerInvariant())
		if ($fileEntryMap.ContainsKey($entryKey)) {
			continue
		}

		[void]$mergedFileEntries.Add([pscustomobject]@{
			AssetType = $assetType
			OldRelativePath = $oldRelativePath
			NewRelativePath = $newRelativePath
		})
		$fileEntryMap[$entryKey] = $true
	}

	$mergedCommandEntries = New-Object System.Collections.ArrayList
	$commandEntryMap = @{}
	$commandEntrySources = @()
	if ($null -ne $existingBackupData -and $null -ne $existingBackupData.CommandReferenceEntries) {
		$commandEntrySources += @($existingBackupData.CommandReferenceEntries)
	}
	$commandEntrySources += @($script:assetCommandBackupEntries)

	foreach ($entry in $commandEntrySources) {
		if ($null -eq $entry) {
			continue
		}

		$assetType = [string]$entry.AssetType
		$oldRef = Normalize-Ref ([string]$entry.OldRef)
		$newRef = Normalize-Ref ([string]$entry.NewRef)
		if ([string]::IsNullOrWhiteSpace($assetType) -or [string]::IsNullOrWhiteSpace($oldRef) -or [string]::IsNullOrWhiteSpace($newRef)) {
			continue
		}

		$entryKey = ($assetType.ToLowerInvariant() + '|' + $oldRef.ToLowerInvariant() + '|' + $newRef.ToLowerInvariant())
		if ($commandEntryMap.ContainsKey($entryKey)) {
			continue
		}

		[void]$mergedCommandEntries.Add([pscustomobject]@{
			AssetType = $assetType
			OldRef = $oldRef
			NewRef = $newRef
		})
		$commandEntryMap[$entryKey] = $true
	}

	if ($mergedFileEntries.Count -eq 0 -and $mergedCommandEntries.Count -eq 0 -and (Test-Path -LiteralPath $backupFilePath)) {
		return $backupFilePath
	}

	$backupContent = [ordered]@{
		Version = 1
		CreatedAt = (Get-Date).ToString('o')
		Engine = $EngineValue
		GameRoot = $GameRootPath
		FileRenameEntries = @($mergedFileEntries)
		CommandReferenceEntries = @($mergedCommandEntries)
	}

	$backupJson = $backupContent | ConvertTo-Json -Depth 10
	Set-Content -LiteralPath $backupFilePath -Value $backupJson -Encoding UTF8
	return $backupFilePath
}

function Get-DragDropFilePlan {
	param([string[]]$Paths)

	$plan = New-Object System.Collections.ArrayList
	$seenFiles = @{}

	foreach ($rawPath in $Paths) {
		if ([string]::IsNullOrWhiteSpace($rawPath)) {
			continue
		}

		if (-not (Test-Path -LiteralPath $rawPath)) {
			Write-Host ("WARNING: Dropped path does not exist: {0}" -f $rawPath)
			continue
		}

		$resolvedPath = (Resolve-Path -LiteralPath $rawPath).Path
		$item = Get-Item -LiteralPath $resolvedPath

		if ($item.PSIsContainer) {
			$rootPath = $item.FullName
			$backupRoot = Join-Path (Split-Path $rootPath -Parent) ((Split-Path $rootPath -Leaf) + '-TRBackup')
			$files = Get-ChildItem -LiteralPath $rootPath -Recurse -File -ErrorAction SilentlyContinue

			foreach ($file in $files) {
				$fullPath = $file.FullName
				$fileKey = $fullPath.ToLowerInvariant()
				if ($seenFiles.ContainsKey($fileKey)) {
					continue
				}

				$seenFiles[$fileKey] = $true
				$relativePath = Get-RelativePathSafe -BasePath $rootPath -TargetPath $fullPath
				$backupPath = Join-Path $backupRoot $relativePath

				[void]$plan.Add([pscustomobject]@{
					FilePath = $fullPath
					RootPath = $rootPath
					BackupRoot = $backupRoot
					BackupPath = $backupPath
				})
			}
		} else {
			$fullPath = $item.FullName
			$fileKey = $fullPath.ToLowerInvariant()
			if ($seenFiles.ContainsKey($fileKey)) {
				continue
			}

			$seenFiles[$fileKey] = $true
			$rootPath = Split-Path $fullPath -Parent
			$backupRoot = Join-Path (Split-Path $rootPath -Parent) ((Split-Path $rootPath -Leaf) + '-TRBackup')
			$backupPath = Join-Path $backupRoot (Split-Path $fullPath -Leaf)

			[void]$plan.Add([pscustomobject]@{
				FilePath = $fullPath
				RootPath = $rootPath
				BackupRoot = $backupRoot
				BackupPath = $backupPath
			})
		}
	}

	return ,$plan
}

function Invoke-DragDropMode {
	if ((-not $InputPaths -or $InputPaths.Count -eq 0) -and (-not [string]::IsNullOrWhiteSpace($InputListFile))) {
		if (Test-Path -LiteralPath $InputListFile) {
			$InputPaths = @(
				Get-Content -LiteralPath $InputListFile |
				ForEach-Object { $_.Trim() } |
				Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
				ForEach-Object { $_.Trim('"') }
			)
		}
	}

	if (-not $InputPaths -or $InputPaths.Count -eq 0) {
		throw 'No input paths were provided. Drag files or folders onto the batch file, or use Send To.'
	}

	Initialize-TranslationSession -ExplicitApiUrl $ApiUrl -SettingsPath $UserSettingsFile -RequestTimeoutSec $TimeoutSec

	$filePlan = Get-DragDropFilePlan -Paths $InputPaths
	if (-not $filePlan -or $filePlan.Count -eq 0) {
		throw 'No files were found to process from the dropped paths.'
	}

	$backupRoots = @{}
	$totalFiles = $filePlan.Count
	$translatedFiles = 0
	$skippedBinary = 0
	$skippedUnreadable = 0

	foreach ($entry in $filePlan) {
		$backupRoots[$entry.BackupRoot.ToLowerInvariant()] = $entry.BackupRoot

		$backupDir = Split-Path $entry.BackupPath -Parent
		if (-not (Test-Path -LiteralPath $backupDir)) {
			New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
		}

		Copy-Item -LiteralPath $entry.FilePath -Destination $entry.BackupPath -Force

		if (-not (Test-IsLikelyTextFile -Path $entry.FilePath)) {
			$skippedBinary++
			continue
		}

		$textResult = Read-TextFile -Path $entry.FilePath
		if ($null -eq $textResult) {
			$skippedUnreadable++
			continue
		}

		$originalText = $textResult.Text
		$translatedText = Translate-JapaneseSegments -Text $originalText

		if ($translatedText -cne $originalText) {
			Write-TextFile -Path $entry.FilePath -Text $translatedText -Encoding $textResult.Encoding
			$translatedFiles++
		}
	}

	Write-Host ''
	Write-Host 'Done.'
	Write-Host ("Mode: DragDrop")
	Write-Host ("Total files found: {0}" -f $totalFiles)
	Write-Host ("Total files translated: {0}" -f $translatedFiles)
	Write-Host ("Skipped binary files: {0}" -f $skippedBinary)
	Write-Host ("Skipped unreadable files: {0}" -f $skippedUnreadable)
	Write-Host ("Unique translation requests sent: {0}" -f $script:translationRequests)
	Write-Host ("Translated segments applied: {0}" -f $script:translatedSegments)

	$backupRootValues = @($backupRoots.Values | Sort-Object)
	if ($backupRootValues.Count -gt 0) {
		Write-Host 'Backup folders used:'
		foreach ($folder in $backupRootValues) {
			Write-Host ("  - {0}" -f $folder)
		}
	}
}

function Build-RestoreCommandMap {
	param([object[]]$CommandReferenceEntries)

	$map = @{}

	foreach ($entry in $CommandReferenceEntries) {
		if ($null -eq $entry) {
			continue
		}

		$assetType = [string]$entry.AssetType
		$oldRef = Normalize-Ref ([string]$entry.OldRef)
		$newRef = Normalize-Ref ([string]$entry.NewRef)

		if ([string]::IsNullOrWhiteSpace($assetType) -or [string]::IsNullOrWhiteSpace($oldRef) -or [string]::IsNullOrWhiteSpace($newRef)) {
			continue
		}

		$key = ($assetType.ToLowerInvariant() + '|' + $newRef.ToLowerInvariant())
		$map[$key] = $oldRef
	}

	return $map
}

function Restore-EventCommandReferences {
	param(
		[object]$CommandObject,
		[hashtable]$RestoreMap
	)

	$codeValue = Get-ObjectPropertyValue -Object $CommandObject -Name 'code'
	$parameters = Get-ObjectPropertyValue -Object $CommandObject -Name 'parameters'

	if ($null -eq $codeValue -or $null -eq $parameters) {
		return $false
	}

	if (-not ($parameters -is [System.Collections.IList])) {
		return $false
	}

	[int]$code = 0
	if (-not [int]::TryParse([string]$codeValue, [ref]$code)) {
		return $false
	}

	$targets = Get-AssetTargetsForCode -Code $code
	foreach ($target in $targets) {
		$currentRef = Get-AssetReferenceFromParameters -Parameters $parameters -Target $target
		if ([string]::IsNullOrWhiteSpace($currentRef)) {
			continue
		}

		$key = ($target.AssetType.ToLowerInvariant() + '|' + (Normalize-Ref $currentRef).ToLowerInvariant())
		if ($RestoreMap.ContainsKey($key)) {
			$oldRef = [string]$RestoreMap[$key]
			Set-AssetReferenceInParameters -Parameters $parameters -Target $target -NewValue $oldRef
			$script:restoreCurrentFileChanged = $true
			$script:restoreCommandRefsChanged++
		}
	}

	Set-ObjectPropertyValue -Object $CommandObject -Name 'parameters' -Value $parameters

	return $true
}

function Process-RestoreNode {
	param(
		[object]$Node,
		[hashtable]$RestoreMap
	)

	if ($null -eq $Node) {
		return
	}

	if ($Node -is [System.Collections.IList]) {
		for ($i = 0; $i -lt $Node.Count; $i++) {
			Process-RestoreNode -Node $Node[$i] -RestoreMap $RestoreMap
		}
		return
	}

	if ($Node -is [System.Collections.IDictionary]) {
		[void](Restore-EventCommandReferences -CommandObject $Node -RestoreMap $RestoreMap)
		foreach ($key in @($Node.Keys)) {
			Process-RestoreNode -Node $Node[$key] -RestoreMap $RestoreMap
		}
		return
	}

	if ($Node -is [pscustomobject]) {
		[void](Restore-EventCommandReferences -CommandObject $Node -RestoreMap $RestoreMap)
		foreach ($property in $Node.PSObject.Properties) {
			Process-RestoreNode -Node $property.Value -RestoreMap $RestoreMap
		}
	}
}

function Restore-CommandReferencesInData {
	param(
		[string]$GameRootPath,
		[object[]]$CommandReferenceEntries
	)

	$restoreMap = Build-RestoreCommandMap -CommandReferenceEntries $CommandReferenceEntries
	if ($restoreMap.Count -eq 0) {
		return [pscustomobject]@{
			FilesChanged = 0
			CommandRefsRestored = 0
		}
	}

	$dataRoot = Join-Path $GameRootPath 'data'
	if (-not (Test-Path -LiteralPath $dataRoot)) {
		return [pscustomobject]@{
			FilesChanged = 0
			CommandRefsRestored = 0
		}
	}

	$filesChanged = 0
	$refsRestored = 0

	$jsonFiles = Get-ChildItem -LiteralPath $dataRoot -File -Filter '*.json' | Sort-Object Name
	foreach ($file in $jsonFiles) {
		try {
			$raw = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
			$trimmedRaw = $raw.Trim()
			$expectsTopLevelArray = $trimmedRaw.StartsWith('[') -and $trimmedRaw.EndsWith(']')
			$jsonObject = ConvertFrom-Json -InputObject $raw
			if ($expectsTopLevelArray -and -not ($jsonObject -is [System.Collections.IList])) {
				$jsonObject = @($jsonObject)
			}
		} catch {
			continue
		}

		$script:restoreCurrentFileChanged = $false
		$script:restoreCommandRefsChanged = 0

		Process-RestoreNode -Node $jsonObject -RestoreMap $restoreMap

		if ($script:restoreCurrentFileChanged) {
			$outputObject = $jsonObject
			if ($expectsTopLevelArray -and -not ($outputObject -is [System.Collections.IList])) {
				$outputObject = @($outputObject)
			}

			if ($expectsTopLevelArray) {
				$updatedJson = ConvertTo-Json -InputObject @($outputObject) -Depth 100 -Compress
			} else {
				$updatedJson = ConvertTo-Json -InputObject $outputObject -Depth 100 -Compress
			}
			Set-Content -LiteralPath $file.FullName -Value $updatedJson -Encoding UTF8
			$filesChanged++
			$refsRestored += $script:restoreCommandRefsChanged
		}
	}

	return [pscustomobject]@{
		FilesChanged = $filesChanged
		CommandRefsRestored = $refsRestored
	}
}

function Restore-AssetFiles {
	param(
		[string]$GameRootPath,
		[object[]]$FileRenameEntries
	)

	$restored = 0
	$skipped = 0

	foreach ($entry in $FileRenameEntries) {
		if ($null -eq $entry) {
			continue
		}

		$oldRelativePath = ([string]$entry.OldRelativePath) -replace '/', '\\'
		$newRelativePath = ([string]$entry.NewRelativePath) -replace '/', '\\'

		if ([string]::IsNullOrWhiteSpace($oldRelativePath) -or [string]::IsNullOrWhiteSpace($newRelativePath)) {
			continue
		}

		$oldFullPath = Join-Path $GameRootPath $oldRelativePath
		$newFullPath = Join-Path $GameRootPath $newRelativePath

		if (Test-Path -LiteralPath $newFullPath) {
			if (Test-Path -LiteralPath $oldFullPath) {
				$skipped++
				continue
			}

			$oldDir = Split-Path $oldFullPath -Parent
			if (-not (Test-Path -LiteralPath $oldDir)) {
				New-Item -ItemType Directory -Path $oldDir -Force | Out-Null
			}

			Move-Item -LiteralPath $newFullPath -Destination $oldFullPath
			$restored++
			continue
		}

		if (Test-Path -LiteralPath $oldFullPath) {
			$skipped++
			continue
		}

		$skipped++
	}

	return [pscustomobject]@{
		Restored = $restored
		Skipped = $skipped
	}
}

function Get-RestoreCandidateRoots {
	param([string]$BaseRoot)

	$resolvedBase = (Resolve-Path -LiteralPath $BaseRoot).Path
	$candidates = @(
		$resolvedBase,
		(Join-Path $resolvedBase 'www'),
		(Join-Path $resolvedBase 'MV\www'),
		(Join-Path $resolvedBase 'MZ')
	)

	$existing = New-Object System.Collections.ArrayList
	$seen = @{}

	foreach ($candidate in $candidates) {
		if (-not (Test-Path -LiteralPath $candidate)) {
			continue
		}

		$full = [System.IO.Path]::GetFullPath($candidate)
		$key = $full.ToLowerInvariant()
		if ($seen.ContainsKey($key)) {
			continue
		}

		$seen[$key] = $true
		[void]$existing.Add($full)
	}

	return ,$existing
}

function Invoke-DatabaseMode {
	if ([string]::IsNullOrWhiteSpace($Engine)) {
		throw "Parameter -Engine is required in Database mode."
	}

	$resolvedRootDir = (Resolve-Path -LiteralPath $RootDir).Path
	$gameRoot = Resolve-GameRootForEngine -EngineValue $Engine -BaseRoot $resolvedRootDir

	Initialize-TranslationSession -ExplicitApiUrl $ApiUrl -SettingsPath $UserSettingsFile -RequestTimeoutSec $TimeoutSec

	$backupRoot = Backup-DataFolder -ResolvedGameRoot $gameRoot
	$dataRoot = Join-Path $gameRoot 'data'

	$script:dbTranslateAssets = [bool]$TranslateAssets
	$script:dbGameRoot = $gameRoot
	$script:dbAssetRoots = Get-AssetRootsForEngine -ResolvedGameRoot $gameRoot -EngineValue $Engine
	$script:dbCurrentFileChanged = $false
	$script:dbStringValuesChanged = 0
	$script:dbAssetReferenceChanges = 0
	$script:dbAssetReferencesUnresolved = 0
	$script:dbAssetsRenamed = 0
	$script:dbAssetReferencesSkippedProtected = 0
	$script:assetReferenceDetectionCache = @{}

	$script:assetRenameOperationMap = @{}
	$script:assetRenameBackupMap = @{}
	$script:assetCommandBackupMap = @{}
	$script:assetMissingSourceWarningMap = @{}
	$script:assetTargetExistsWarningMap = @{}
	$script:assetRenameFailureWarningMap = @{}
	$script:assetUnresolvedTargetWarningMap = @{}
	$script:assetRenameBackupEntries = New-Object System.Collections.ArrayList
	$script:assetCommandBackupEntries = New-Object System.Collections.ArrayList

	$assetMapReuseCount = 0
	$pluginReferenceCount = 0
	if ($TranslateAssets) {
		$assetMapReuseCount = Initialize-AssetReferenceTranslationMap -BackupRoot $backupRoot
		$pluginReferenceCount = Initialize-PluginReferenceSet -GameRootPath $gameRoot
	} else {
		$script:assetReferenceTranslationMap = @{}
		$script:pluginReferenceSet = @{}
		$script:pluginProtectedAssetWarningMap = @{}
	}

	$jsonFiles = Get-ChildItem -LiteralPath $dataRoot -File -Filter '*.json' | Sort-Object Name

	$totalFiles = 0
	$translatedFiles = 0

	foreach ($file in $jsonFiles) {
		$totalFiles++
		if (Process-DatabaseJsonFile -FilePath $file.FullName) {
			$translatedFiles++
			Write-Host ("Updated: {0}" -f $file.Name)
		}
	}

	$assetBackupPath = $null
	if ($TranslateAssets) {
		$assetBackupPath = Write-AssetNamesBackupFile -BackupRoot $backupRoot -EngineValue $Engine -GameRootPath $gameRoot
	}

	Write-Host ''
	Write-Host 'Done.'
	Write-Host ("Mode: Database")
	Write-Host ("Engine: {0}" -f $Engine)
	Write-Host ("Resolved game root: {0}" -f $gameRoot)
	Write-Host ("Data backup folder: {0}" -f $backupRoot)
	Write-Host ("JSON files scanned: {0}" -f $totalFiles)
	Write-Host ("Total files translated: {0}" -f $translatedFiles)
	Write-Host ("String values changed: {0}" -f $script:dbStringValuesChanged)
	Write-Host ("Unique translation requests sent: {0}" -f $script:translationRequests)
	Write-Host ("Translated segments applied: {0}" -f $script:translatedSegments)

	if ($TranslateAssets) {
		Write-Host ("Asset command references translated: {0}" -f $script:dbAssetReferenceChanges)
		Write-Host ("Asset reference updates rejected (unresolvable targets): {0}" -f $script:dbAssetReferencesUnresolved)
		Write-Host ("Assets renamed: {0}" -f $script:dbAssetsRenamed)
		Write-Host ("Asset mappings reused from backup: {0}" -f $assetMapReuseCount)
		Write-Host ("Plugin-linked asset references skipped: {0}" -f $script:dbAssetReferencesSkippedProtected)
		Write-Host ("Plugin reference tokens scanned: {0}" -f $pluginReferenceCount)
		Write-Host ("Asset names backup file: {0}" -f $assetBackupPath)
	}
}

function Invoke-RestoreAssetNamesMode {
	$resolvedRootDir = (Resolve-Path -LiteralPath $RootDir).Path
	$candidateRoots = Get-RestoreCandidateRoots -BaseRoot $resolvedRootDir

	$backupTargets = New-Object System.Collections.ArrayList
	foreach ($candidateRoot in $candidateRoots) {
		$backupPath = Join-Path $candidateRoot 'data - TRBackup\AssetNamesBackup.json'
		if (Test-Path -LiteralPath $backupPath) {
			[void]$backupTargets.Add([pscustomobject]@{
				GameRoot = $candidateRoot
				BackupFile = $backupPath
			})
		}
	}

	if ($backupTargets.Count -eq 0) {
		throw "Restore failed: no AssetNamesBackup.json was found in any 'data - TRBackup' folder under '$resolvedRootDir'."
	}

	$totalAssetsRestored = 0
	$totalAssetsSkipped = 0
	$totalDataFilesChanged = 0
	$totalCommandRefsRestored = 0

	foreach ($target in $backupTargets) {
		$backupData = Get-Content -LiteralPath $target.BackupFile -Raw | ConvertFrom-Json

		$fileEntries = @()
		if ($null -ne $backupData.FileRenameEntries) {
			$fileEntries = @($backupData.FileRenameEntries)
		}

		$commandEntries = @()
		if ($null -ne $backupData.CommandReferenceEntries) {
			$commandEntries = @($backupData.CommandReferenceEntries)
		}

		$assetResult = Restore-AssetFiles -GameRootPath $target.GameRoot -FileRenameEntries $fileEntries
		$dataResult = Restore-CommandReferencesInData -GameRootPath $target.GameRoot -CommandReferenceEntries $commandEntries

		$totalAssetsRestored += $assetResult.Restored
		$totalAssetsSkipped += $assetResult.Skipped
		$totalDataFilesChanged += $dataResult.FilesChanged
		$totalCommandRefsRestored += $dataResult.CommandRefsRestored

		Write-Host ("Restored game root: {0}" -f $target.GameRoot)
		Write-Host ("  Backup file: {0}" -f $target.BackupFile)
		Write-Host ("  Assets restored: {0}" -f $assetResult.Restored)
		Write-Host ("  Data files updated: {0}" -f $dataResult.FilesChanged)
	}

	Write-Host ''
	Write-Host 'Done.'
	Write-Host 'Mode: RestoreAssetNames'
	Write-Host ("Total assets restored: {0}" -f $totalAssetsRestored)
	Write-Host ("Total assets skipped: {0}" -f $totalAssetsSkipped)
	Write-Host ("Total command references restored: {0}" -f $totalCommandRefsRestored)
	Write-Host ("Total data files updated: {0}" -f $totalDataFilesChanged)
}

$RootDir = $RootDir.Trim('"')
if (-not (Test-Path -LiteralPath $RootDir)) {
	throw "RootDir does not exist: $RootDir"
}

switch ($Mode) {
	'DragDrop' {
		Invoke-DragDropMode
	}
	'Database' {
		Invoke-DatabaseMode
	}
	'RestoreAssetNames' {
		Invoke-RestoreAssetNamesMode
	}
	default {
		throw "Unsupported mode: $Mode"
	}
}
