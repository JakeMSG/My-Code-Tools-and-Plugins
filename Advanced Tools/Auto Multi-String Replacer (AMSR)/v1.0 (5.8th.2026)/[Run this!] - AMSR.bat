@echo off
setlocal EnableExtensions DisableDelayedExpansion
title AMSR String Replacer

set "ROOT=%~dp0"
set "SETTINGS_FILE=%ROOT%# AMSR Settings.txt"
set "STRINGS_FILE=%ROOT%# AMSR Strings.txt"
set "XCHANG_EXE=%ROOT%(''xchang32'' cmd utility).exe"

if not exist "%SETTINGS_FILE%" (
	echo Missing file: "%SETTINGS_FILE%"
	pause
	exit /b 1
)

:MENU
cls
echo ===================================================
echo AMSR (Auto Multi-String Replacer) Menu
echo ===================================================
echo 1. Apply replacements ^(also creates backups of the files to change^)
echo 2. Restore target files from backup^(s^)
echo Q. Quit
echo.
choice /C 12Q /N /M "Choose option: "

if errorlevel 3 goto :EOF
if errorlevel 2 call :RUN_MODE restore
if errorlevel 1 call :RUN_MODE apply

echo.
echo Press any key to return to menu...
pause >nul
goto :MENU

:RUN_MODE
set "AMSR_MODE=%~1"
set "AMSR_SELF=%~f0"
set "AMSR_ROOT=%ROOT%"
set "AMSR_SETTINGS=%SETTINGS_FILE%"
set "AMSR_STRINGS=%STRINGS_FILE%"
set "AMSR_XCHANG=%XCHANG_EXE%"

echo.
echo Running mode: %AMSR_MODE%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
	"$ErrorActionPreference = 'Stop';" ^
	"$self = $env:AMSR_SELF;" ^
	"$raw = Get-Content -LiteralPath $self -Raw;" ^
	"$match = [regex]::Match($raw, '(?ms)^:__AMSR_PS_BEGIN__\r?\n(.*?)^:__AMSR_PS_END__\r?$');" ^
	"if (-not $match.Success) { throw 'Embedded PowerShell block not found.' }" ^
	"$worker = [scriptblock]::Create($match.Groups[1].Value);" ^
	"& $worker"

set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" (
	echo.
	echo Operation failed. Exit code: %RC%
) else (
	echo.
	echo Operation completed.
)

exit /b %RC%

goto :EOF

:__AMSR_PS_BEGIN__
$ErrorActionPreference = 'Stop'

$Mode = $env:AMSR_MODE
$Root = $env:AMSR_ROOT
$SettingsFile = $env:AMSR_SETTINGS
$StringsFile = $env:AMSR_STRINGS
$XchangExe = $env:AMSR_XCHANG

if ($Mode -notin @('apply', 'restore')) {
	throw "Invalid mode: $Mode"
}

function Get-TargetPaths {
	param(
		[string]$SettingsPath,
		[string]$RootPath
	)

	$raw = [System.IO.File]::ReadAllText($SettingsPath)
	$header = [regex]::Match($raw, '(?im)^\s*========\s*Target file(?:\(s\))?\s*:\s*(.*)$')
	if (-not $header.Success) {
		throw "Could not find target file section in settings file."
	}

	$tail = $header.Groups[1].Value + "`n" + $raw.Substring($header.Index + $header.Length)
	$quoted = [regex]::Matches($tail, '"([^"]*)"')
	if ($quoted.Count -eq 0) {
		throw "No quoted target files found in settings target section."
	}

	$targets = New-Object System.Collections.Generic.List[string]
	$seen = @{}

	foreach ($match in $quoted) {
		$targetSpec = $match.Groups[1].Value.Trim()
		if ([string]::IsNullOrWhiteSpace($targetSpec)) {
			continue
		}

		$resolved = if ([System.IO.Path]::IsPathRooted($targetSpec)) {
			[System.IO.Path]::GetFullPath($targetSpec)
		} else {
			[System.IO.Path]::GetFullPath((Join-Path -Path $RootPath -ChildPath $targetSpec))
		}

		if (-not $seen.ContainsKey($resolved)) {
			$seen[$resolved] = $true
			$targets.Add($resolved) | Out-Null
		}
	}

	if ($targets.Count -eq 0) {
		throw "All quoted target file entries in settings are empty."
	}

	return @($targets.ToArray())
}

function Get-BackupPath {
	param([string]$TargetPath)

	$dir = [System.IO.Path]::GetDirectoryName($TargetPath)
	$name = [System.IO.Path]::GetFileName($TargetPath)

	return Join-Path -Path $dir -ChildPath ($name + '-backup')
}

function Parse-StringEntries {
	param([string]$Path)

	$raw = [System.IO.File]::ReadAllText($Path)
	$joinNewline = if ($raw.Contains("`r`n")) { "`r`n" } else { "`n" }
	$lines = $raw -split "`r?`n"

	$entries = New-Object System.Collections.Generic.List[object]
	$section = $null
	$inEntry = $false
	$inReplace = $false
	$seenSeparator = $false
	$searchLines = New-Object System.Collections.Generic.List[string]
	$replaceLines = New-Object System.Collections.Generic.List[string]

	foreach ($line in $lines) {
		if ($line -match '^\s*################\s*Non-RegEx\b') {
			if ($inEntry) {
				if (-not $seenSeparator) {
					throw "Entry is missing separator line starting with '===='."
				}

				$entries.Add([pscustomobject]@{
					Type = $section
					Search = [string]::Join($joinNewline, $searchLines)
					Replace = [string]::Join($joinNewline, $replaceLines)
				}) | Out-Null

				$inEntry = $false
				$inReplace = $false
				$seenSeparator = $false
				$searchLines = New-Object System.Collections.Generic.List[string]
				$replaceLines = New-Object System.Collections.Generic.List[string]
			}

			$section = 'NonRegex'
			continue
		}

		if ($line -match '^\s*################\s*RegEx\b') {
			if ($inEntry) {
				if (-not $seenSeparator) {
					throw "Entry is missing separator line starting with '===='."
				}

				$entries.Add([pscustomobject]@{
					Type = $section
					Search = [string]::Join($joinNewline, $searchLines)
					Replace = [string]::Join($joinNewline, $replaceLines)
				}) | Out-Null

				$inEntry = $false
				$inReplace = $false
				$seenSeparator = $false
				$searchLines = New-Object System.Collections.Generic.List[string]
				$replaceLines = New-Object System.Collections.Generic.List[string]
			}

			$section = 'Regex'
			continue
		}

		if (-not $section) {
			continue
		}

		if ($line -match '^\s*========') {
			if ($inEntry) {
				if (-not $seenSeparator) {
					throw "Entry is missing separator line starting with '===='."
				}

				$entries.Add([pscustomobject]@{
					Type = $section
					Search = [string]::Join($joinNewline, $searchLines)
					Replace = [string]::Join($joinNewline, $replaceLines)
				}) | Out-Null
			}

			$inEntry = $true
			$inReplace = $false
			$seenSeparator = $false
			$searchLines = New-Object System.Collections.Generic.List[string]
			$replaceLines = New-Object System.Collections.Generic.List[string]
			continue
		}

		if (-not $inEntry) {
			continue
		}

		if ($line -match '^\s*====') {
			$inReplace = $true
			$seenSeparator = $true
			continue
		}

		if ($inReplace) {
			$replaceLines.Add($line) | Out-Null
		} else {
			$searchLines.Add($line) | Out-Null
		}
	}

	if ($inEntry) {
		if (-not $seenSeparator) {
			throw "Entry is missing separator line starting with '===='."
		}

		$entries.Add([pscustomobject]@{
			Type = $section
			Search = [string]::Join($joinNewline, $searchLines)
			Replace = [string]::Join($joinNewline, $replaceLines)
		}) | Out-Null
	}

	if ($entries.Count -eq 0) {
		throw "No replacement entries found in strings file."
	}

	return $entries
}

function Read-TextKeepingEncoding {
	param([string]$Path)

	$bytes = [System.IO.File]::ReadAllBytes($Path)
	$encoding = $null
	$emitBom = $false
	$bomLength = 0

	if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
		$encoding = New-Object System.Text.UTF8Encoding($true)
		$emitBom = $true
		$bomLength = 3
	} elseif ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
		$encoding = New-Object System.Text.UnicodeEncoding($false, $true)
		$emitBom = $true
		$bomLength = 2
	} elseif ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
		$encoding = New-Object System.Text.UnicodeEncoding($true, $true)
		$emitBom = $true
		$bomLength = 2
	} elseif ($bytes.Length -ge 4 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE -and $bytes[2] -eq 0x00 -and $bytes[3] -eq 0x00) {
		$encoding = [System.Text.Encoding]::UTF32
		$emitBom = $true
		$bomLength = 4
	} else {
		try {
			$null = (New-Object System.Text.UTF8Encoding($false, $true)).GetString($bytes)
			$encoding = New-Object System.Text.UTF8Encoding($false)
		} catch {
			$encoding = [System.Text.Encoding]::Default
		}

		$emitBom = $false
		$bomLength = 0
	}

	$text = $encoding.GetString($bytes, $bomLength, $bytes.Length - $bomLength)

	return [pscustomobject]@{
		Text = $text
		Encoding = $encoding
		EmitBom = $emitBom
	}
}

function Write-TextKeepingEncoding {
	param(
		[string]$Path,
		[string]$Text,
		[System.Text.Encoding]$Encoding,
		[bool]$EmitBom
	)

	$body = $Encoding.GetBytes($Text)
	$bom = if ($EmitBom) { $Encoding.GetPreamble() } else { [byte[]]@() }

	$output = New-Object byte[] ($bom.Length + $body.Length)

	if ($bom.Length -gt 0) {
		[Array]::Copy($bom, 0, $output, 0, $bom.Length)
	}

	if ($body.Length -gt 0) {
		[Array]::Copy($body, 0, $output, $bom.Length, $body.Length)
	}

	[System.IO.File]::WriteAllBytes($Path, $output)
}

function Convert-ToXchangSpec {
	param([string]$Text)

	$bytes = [System.Text.Encoding]::Default.GetBytes($Text)
	if ($bytes.Length -eq 0) {
		return ''
	}

	$parts = New-Object System.Collections.Generic.List[string]
	foreach ($value in $bytes) {
		$parts.Add(('^x{0:X2}' -f $value)) | Out-Null
	}

	return [string]::Join(',', $parts)
}

function Invoke-XchangReplace {
	param(
		[string]$ExePath,
		[string]$FilePath,
		[string]$SearchText,
		[string]$ReplaceText,
		[int]$EntryNumber,
		[int]$TotalEntries
	)

	if ($SearchText.Length -eq 0) {
		Write-Host ('[{0}/{1}] Non-RegEx skipped: empty search string.' -f $EntryNumber, $TotalEntries)
		return
	}

	$searchSpec = Convert-ToXchangSpec -Text $SearchText
	$replaceSpec = Convert-ToXchangSpec -Text $ReplaceText
	$scriptPath = [System.IO.Path]::GetTempFileName()
	$targetDir = [System.IO.Path]::GetDirectoryName($FilePath)
	$oldTemp = $env:TEMP
	$oldTmp = $env:TMP

	try {
		[System.IO.File]::WriteAllText($scriptPath, ('"{0}" "{1}"' -f $searchSpec, $replaceSpec), [System.Text.Encoding]::ASCII)
		$env:TEMP = $targetDir
		$env:TMP = $targetDir

		Write-Host ('[{0}/{1}] Non-RegEx -> xchang32' -f $EntryNumber, $TotalEntries)
		& $ExePath $FilePath "@$scriptPath"
		$exitCode = $LASTEXITCODE

		switch ($exitCode) {
			0 { Write-Host '  Changed' }
			1 { Write-Host '  Not Changed' }
			default { throw ('xchang32 failed at entry {0}. errorlevel={1}' -f $EntryNumber, $exitCode) }
		}
	} finally {
		$env:TEMP = $oldTemp
		$env:TMP = $oldTmp
		Remove-Item -LiteralPath $scriptPath -ErrorAction SilentlyContinue
	}
}

function Invoke-RegexReplace {
	param(
		[string]$FilePath,
		[string]$Pattern,
		[string]$Replacement,
		[int]$EntryNumber,
		[int]$TotalEntries
	)

	if ($Pattern.Length -eq 0) {
		Write-Host ('[{0}/{1}] RegEx skipped: empty pattern.' -f $EntryNumber, $TotalEntries)
		return
	}

	Write-Host ('[{0}/{1}] RegEx -> .NET regex' -f $EntryNumber, $TotalEntries)

	$fileState = Read-TextKeepingEncoding -Path $FilePath
	$effectiveReplacement = Convert-BasicEscapes -Text $Replacement

	try {
		$updated = [System.Text.RegularExpressions.Regex]::Replace($fileState.Text, $Pattern, $effectiveReplacement)
	} catch {
		throw ('Regex failed at entry {0}. {1}' -f $EntryNumber, $_.Exception.Message)
	}

	if ($updated -ne $fileState.Text) {
		Write-TextKeepingEncoding -Path $FilePath -Text $updated -Encoding $fileState.Encoding -EmitBom $fileState.EmitBom
		Write-Host '  Changed'
	} else {
		Write-Host '  Not Changed'
	}
}

function Convert-BasicEscapes {
	param([string]$Text)

	if ($null -eq $Text -or $Text.Length -eq 0) {
		return $Text
	}

	$builder = New-Object System.Text.StringBuilder

	for ($i = 0; $i -lt $Text.Length; $i++) {
		$char = $Text[$i]
		$escapeConsumed = $false

		if ($char -eq '\' -and ($i + 1) -lt $Text.Length) {
			$next = $Text[$i + 1]

			switch ($next) {
				'n' {
					[void]$builder.Append("`n")
					$i++
					$escapeConsumed = $true
					break
				}
				'r' {
					[void]$builder.Append("`r")
					$i++
					$escapeConsumed = $true
					break
				}
				't' {
					[void]$builder.Append("`t")
					$i++
					$escapeConsumed = $true
					break
				}
				'\' {
					[void]$builder.Append('\')
					$i++
					$escapeConsumed = $true
					break
				}
			}

			if ($escapeConsumed) {
				continue
			}
		}

		[void]$builder.Append($char)
	}

	return $builder.ToString()
}

if (-not (Test-Path -LiteralPath $SettingsFile -PathType Leaf)) {
	throw "Settings file not found: $SettingsFile"
}

$targetPaths = @(Get-TargetPaths -SettingsPath $SettingsFile -RootPath $Root)

Write-Host ('Mode: {0}' -f $Mode)
Write-Host ('Total target files: {0}' -f $targetPaths.Count)

if ($Mode -eq 'restore') {
	for ($t = 0; $t -lt $targetPaths.Count; $t++) {
		$targetPath = $targetPaths[$t]
		$backupPath = Get-BackupPath -TargetPath $targetPath

		Write-Host ('Target [{0}/{1}] restore: {2}' -f ($t + 1), $targetPaths.Count, $targetPath)

		if (-not (Test-Path -LiteralPath $backupPath -PathType Leaf)) {
			throw "Backup file not found: $backupPath"
		}

		$targetDir = [System.IO.Path]::GetDirectoryName($targetPath)
		if (-not (Test-Path -LiteralPath $targetDir -PathType Container)) {
			New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
		}

		Copy-Item -LiteralPath $backupPath -Destination $targetPath -Force
		Write-Host ('  Restored from backup: {0}' -f $backupPath)
	}

	Write-Host 'Done.'
	return
}

if (-not (Test-Path -LiteralPath $StringsFile -PathType Leaf)) {
	throw "Strings file not found: $StringsFile"
}

$entries = Parse-StringEntries -Path $StringsFile

$needsXchang = $false
foreach ($entry in $entries) {
	if ($entry.Type -eq 'NonRegex') {
		$needsXchang = $true
		break
	}
}

if ($needsXchang -and -not (Test-Path -LiteralPath $XchangExe -PathType Leaf)) {
	throw "xchang32 executable not found: $XchangExe"
}

Write-Host ('Total entries: {0}' -f $entries.Count)

for ($t = 0; $t -lt $targetPaths.Count; $t++) {
	$targetPath = $targetPaths[$t]

	if (-not (Test-Path -LiteralPath $targetPath -PathType Leaf)) {
		throw "Target file not found: $targetPath"
	}

	Write-Host ('Target [{0}/{1}] apply: {2}' -f ($t + 1), $targetPaths.Count, $targetPath)

	$backupPath = Get-BackupPath -TargetPath $targetPath
	Copy-Item -LiteralPath $targetPath -Destination $backupPath -Force
	Write-Host ('  Backup created: {0}' -f $backupPath)

	$workingPath = $targetPath
	$workingDir = $null
	$useWorkingCopy = $false

	if ($needsXchang -and $targetPath.Length -gt 120) {
		$useWorkingCopy = $true
		$workingDir = Join-Path -Path $env:TEMP -ChildPath ('amsr_xchang_' + [guid]::NewGuid().ToString('N'))
		New-Item -ItemType Directory -Path $workingDir -Force | Out-Null
		$workingPath = Join-Path -Path $workingDir -ChildPath 'target.bin'
		Copy-Item -LiteralPath $targetPath -Destination $workingPath -Force
		Write-Host ('  Using short working path for xchang32: {0}' -f $workingPath)
	}

	try {
		for ($i = 0; $i -lt $entries.Count; $i++) {
			$entry = $entries[$i]
			$entryNumber = $i + 1

			if ($entry.Type -eq 'NonRegex') {
				Invoke-XchangReplace -ExePath $XchangExe -FilePath $workingPath -SearchText $entry.Search -ReplaceText $entry.Replace -EntryNumber $entryNumber -TotalEntries $entries.Count
			} elseif ($entry.Type -eq 'Regex') {
				Invoke-RegexReplace -FilePath $workingPath -Pattern $entry.Search -Replacement $entry.Replace -EntryNumber $entryNumber -TotalEntries $entries.Count
			} else {
				throw ('Unknown entry type at item {0}: {1}' -f $entryNumber, $entry.Type)
			}
		}

		if ($useWorkingCopy) {
			Copy-Item -LiteralPath $workingPath -Destination $targetPath -Force
			Write-Host '  Copied updated working file back to target.'
		}
	} finally {
		if ($useWorkingCopy -and $workingDir) {
			Remove-Item -LiteralPath $workingDir -Recurse -Force -ErrorAction SilentlyContinue
		}
	}
}

Write-Host 'Done.'
:__AMSR_PS_END__
