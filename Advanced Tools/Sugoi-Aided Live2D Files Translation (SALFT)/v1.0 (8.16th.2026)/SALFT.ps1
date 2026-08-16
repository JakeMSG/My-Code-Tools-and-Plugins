param(
	[ValidateSet('DragDrop')]
	[string]$Mode = 'DragDrop',

	[string]$RootDir = $PSScriptRoot,
	[string[]]$InputPaths,
	[string]$InputListFile,
	[string]$ApiUrl,
	[string]$UserSettingsFile = 'F:\Programs\SugoiTranslatorToolkit\Program\Code\User-Settings.json',
	[int]$TimeoutSec = 90
)

$ErrorActionPreference = 'Stop'

$script:japanesePresenceRegex = [regex]'[\p{IsHiragana}\p{IsKatakana}\p{IsCJKUnifiedIdeographs}\u3005\u303B\u30FC\uFF66-\uFF9F]'
$script:japaneseSegmentRegex = [regex]'(?:[\p{IsHiragana}\p{IsKatakana}\p{IsCJKUnifiedIdeographs}\u3005\u303B\u30FC\uFF66-\uFF9F])(?:[\p{IsHiragana}\p{IsKatakana}\p{IsCJKUnifiedIdeographs}\u3005\u303B\u30FC\uFF66-\uFF9F0-9\s\u3000-\u303F\uFF00-\uFF65!?,\.:;\/\\%&+\=\-\u2010\u2013\u2014])*'
$script:jsonNameRegex = [regex]::new('(?<prefix>"Name"\s*:\s*")(?<value>(?:\\.|[^"\\])*)(?<suffix>")', [System.Text.RegularExpressions.RegexOptions]::Compiled)
$script:xmlNameRegex = [regex]::new('<s xs\.n="(?<field>name|localName|description|layerName|groupName|textureName)">(?<value>[^<]*)</s>', [System.Text.RegularExpressions.RegexOptions]::Compiled)
$script:live2dExtensions = @('.json', '.cmo3', '.can3')

$script:translationCache = @{}
$script:translationRequests = 0
$script:translatedSegments = 0
$script:activeApiBase = $null
$script:activeTimeoutSec = $TimeoutSec
$script:utf8NoBom = New-Object System.Text.UTF8Encoding $false

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
		throw "Could not contact Sugoi Translation API at '$BaseUrl'. Open Sugoi Toolkit, then 'Sugoi Translator Offline Japan', and wait until it is loaded. Underlying error: $($_.Exception.Message)"
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
	Write-Host 'Sugoi Translation API is ready.'
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

function Protect-XmlText {
	param([string]$Text)

	if ([string]::IsNullOrEmpty($Text)) {
		return $Text
	}

	return (($Text -replace '&', '&amp;') -replace '<', '&lt;') -replace '>', '&gt;'
}

function ConvertFrom-JsonStringLiteral {
	param([string]$Escaped)

	try {
		return (('"' + $Escaped + '"') | ConvertFrom-Json)
	} catch {
		return $Escaped
	}
}

function ConvertTo-JsonStringLiteral {
	param([string]$Raw)

	$json = $Raw | ConvertTo-Json -Compress
	if ($json.Length -ge 2 -and $json.StartsWith('"') -and $json.EndsWith('"')) {
		return $json.Substring(1, $json.Length - 2)
	}
	return $json
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

	$translatedText = $translatedText -replace [char]0x3000, ' '
	$translatedText = $translatedText -replace ' {2,}', ' '
	return $translatedText.Trim()
}

function Get-RelativePathSafe {
	param(
		[string]$BasePath,
		[string]$TargetPath
	)

	$baseFull = [System.IO.Path]::GetFullPath($BasePath).TrimEnd('\')
	$targetFull = [System.IO.Path]::GetFullPath($TargetPath)

	if ($targetFull.StartsWith($baseFull, [System.StringComparison]::OrdinalIgnoreCase)) {
		$directRelative = $targetFull.Substring($baseFull.Length).TrimStart('\')
		if (-not [string]::IsNullOrWhiteSpace($directRelative)) {
			return $directRelative
		}
	}

	$baseUri = [System.Uri]($baseFull + '\')
	$targetUri = [System.Uri]$targetFull
	$relative = [System.Uri]::UnescapeDataString($baseUri.MakeRelativeUri($targetUri).ToString())
	return $relative.Replace('/', '\')
}

function Test-IsLive2DTargetFile {
	param([System.IO.FileInfo]$File)

	$ext = $File.Extension.ToLowerInvariant()
	if ($script:live2dExtensions -notcontains $ext) {
		return $false
	}

	if ($File.FullName -match '(?i)[-_]TRBackup[\\/]|\.bak$') {
		return $false
	}

	return $true
}

function Initialize-CaffTypes {
	if ('CaffLive2D' -as [type]) {
		return
	}

	Add-Type -AssemblyName System.IO.Compression
	$compressionLocation = [IO.Compression.DeflateStream].Assembly.Location
	$code = @'
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Text;

public class CaffMeta {
	public string Path;
	public string Tag;
	public long Start;
	public int Size;
	public int SizePos;
	public int StartPosField;
	public bool Obfuscated;
	public byte Compression;
}

public class CaffArchiveInfo {
	public uint Key;
	public byte[] Trailing;
	public List<CaffMeta> Entries;
	public byte[] Data;
}

public static class CaffLive2D {
	public static uint ReadU32BE(byte[] d, int pos) {
		return ((uint)d[pos] << 24) | ((uint)d[pos + 1] << 16) | ((uint)d[pos + 2] << 8) | d[pos + 3];
	}

	public static void WriteU32BE(byte[] d, int pos, uint v) {
		d[pos] = (byte)(v >> 24);
		d[pos + 1] = (byte)(v >> 16);
		d[pos + 2] = (byte)(v >> 8);
		d[pos + 3] = (byte)v;
	}

	public static void WriteU64BE(byte[] d, int pos, ulong v) {
		for (int i = 0; i < 8; i++) {
			d[pos + i] = (byte)(v >> (56 - 8 * i));
		}
	}

	public static ulong ReadU64BE(byte[] d, int pos) {
		ulong v = 0;
		for (int i = 0; i < 8; i++) {
			v = (v << 8) | d[pos + i];
		}
		return v;
	}

	public static ulong KeyMask64(uint key) {
		int keyI = unchecked((int)key);
		long keyL = keyI;
		return (ulong)((keyL << 32) | (keyL & 0xFFFFFFFFL));
	}

	public static byte XorU8(byte b, uint key) {
		return (byte)(b ^ (key & 0xFF));
	}

	public static uint XorU32(uint v, uint key) {
		return v ^ key;
	}

	public static ulong XorU64(ulong v, uint key) {
		return v ^ KeyMask64(key);
	}

	class Reader {
		public byte[] D;
		public int P;
		public uint K;

		public byte U8() {
			return XorU8(D[P++], K);
		}

		public uint U32() {
			uint v = ReadU32BE(D, P);
			P += 4;
			return XorU32(v, K);
		}

		public ulong U64() {
			ulong v = ReadU64BE(D, P);
			P += 8;
			return XorU64(v, K);
		}

		public void Skip(int n) {
			P += n;
		}

		public int VarInt() {
			int b0 = U8();
			if ((b0 & 0x80) == 0) return b0;
			int b1 = U8();
			if ((b1 & 0x80) == 0) return ((b0 & 0x7F) << 7) | (b1 & 0x7F);
			int b2 = U8();
			if ((b2 & 0x80) == 0) return ((b0 & 0x7F) << 14) | ((b1 & 0x7F) << 7) | b2;
			int b3 = U8();
			return ((b0 & 0x7F) << 21) | ((b1 & 0x7F) << 14) | ((b2 & 0x7F) << 7) | b3;
		}

		public string Str() {
			int n = VarInt();
			byte[] raw = new byte[n];
			for (int i = 0; i < n; i++) {
				raw[i] = U8();
			}
			return Encoding.UTF8.GetString(raw);
		}
	}

	public static CaffArchiveInfo Parse(byte[] data) {
		if (data == null || data.Length < 54 || data[0] != (byte)'C' || data[1] != (byte)'A' || data[2] != (byte)'F' || data[3] != (byte)'F') {
			throw new Exception("Not a CAFF Live2D editor file.");
		}

		uint key = ReadU32BE(data, 14);
		var r = new Reader { D = data, P = 54, K = key };
		int count = (int)r.U32();
		if (count < 0 || count > 100000) {
			throw new Exception("Invalid CAFF entry count.");
		}

		var entries = new List<CaffMeta>();
		for (int i = 0; i < count; i++) {
			var m = new CaffMeta();
			m.Path = r.Str();
			m.Tag = r.Str();
			m.StartPosField = r.P;
			m.Start = (long)(r.U64() & 0xFFFFFFFFUL);
			m.SizePos = r.P;
			m.Size = (int)r.U32();
			m.Obfuscated = r.U8() != 0;
			m.Compression = r.U8();
			r.Skip(8);
			entries.Add(m);
		}

		int end = data.Length;
		if (entries.Count > 0) {
			CaffMeta last = entries[entries.Count - 1];
			end = (int)last.Start + last.Size;
			if (end < 0 || end > data.Length) {
				end = data.Length;
			}
		}

		byte[] trailing = new byte[Math.Max(0, data.Length - end)];
		if (trailing.Length > 0) {
			Buffer.BlockCopy(data, end, trailing, 0, trailing.Length);
		}

		return new CaffArchiveInfo {
			Key = key,
			Trailing = trailing,
			Entries = entries,
			Data = data
		};
	}

	public static bool IsXmlEntry(CaffMeta m) {
		if (m.Compression != 33 && m.Compression != 37) {
			return false;
		}
		string p = m.Path ?? "";
		string t = m.Tag ?? "";
		return t == "main_xml" || p.EndsWith(".xml", StringComparison.OrdinalIgnoreCase);
	}

	public static byte[] Obfuscate(byte[] stored, uint key, bool obf) {
		if (!obf || key == 0) {
			return stored;
		}
		byte k = (byte)(key & 0xFF);
		byte[] output = new byte[stored.Length];
		for (int i = 0; i < stored.Length; i++) {
			output[i] = (byte)(stored[i] ^ k);
		}
		return output;
	}

	public static byte[] ExtractXml(CaffArchiveInfo info, CaffMeta meta) {
		byte[] stored = Obfuscate(Slice(info.Data, (int)meta.Start, meta.Size), info.Key, meta.Obfuscated);
		return Unzip(stored);
	}

	static byte[] Slice(byte[] data, int start, int size) {
		byte[] output = new byte[size];
		Buffer.BlockCopy(data, start, output, 0, size);
		return output;
	}

	static uint[] crcTable;

	static uint Crc32(byte[] data) {
		if (crcTable == null) {
			crcTable = new uint[256];
			for (uint i = 0; i < 256; i++) {
				uint c = i;
				for (int j = 0; j < 8; j++) {
					c = ((c & 1) != 0) ? (0xEDB88320u ^ (c >> 1)) : (c >> 1);
				}
				crcTable[i] = c;
			}
		}
		uint crc = 0xFFFFFFFFu;
		for (int i = 0; i < data.Length; i++) {
			crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >> 8);
		}
		return crc ^ 0xFFFFFFFFu;
	}

	public static byte[] Unzip(byte[] zipStream) {
		if (zipStream.Length < 30) {
			throw new Exception("Empty CAFF zip stream.");
		}
		int nameLen = zipStream[26] | (zipStream[27] << 8);
		int extraLen = zipStream[28] | (zipStream[29] << 8);
		int payloadStart = 30 + nameLen + extraLen;
		using (var input = new MemoryStream(zipStream, payloadStart, zipStream.Length - payloadStart, false))
		using (var ds = new DeflateStream(input, CompressionMode.Decompress))
		using (var output = new MemoryStream()) {
			ds.CopyTo(output);
			return output.ToArray();
		}
	}

	public static byte[] Zip(byte[] contents, byte compression) {
		CompressionLevel level = (compression == 37) ? CompressionLevel.Optimal : CompressionLevel.Fastest;
		byte[] deflated;
		using (var ms = new MemoryStream()) {
			using (var ds = new DeflateStream(ms, level, true)) {
				ds.Write(contents, 0, contents.Length);
			}
			deflated = ms.ToArray();
		}
		uint crc = Crc32(contents);
		byte[] name = Encoding.ASCII.GetBytes("contents");
		DateTime now = DateTime.Now;
		int dosDate = ((now.Year - 1980) << 9) | (now.Month << 5) | now.Day;
		int dosTime = (now.Hour << 11) | (now.Minute << 5) | (now.Second / 2);
		using (var ms = new MemoryStream())
		using (var bw = new BinaryWriter(ms)) {
			bw.Write((uint)0x04034B50);
			bw.Write((ushort)20);
			bw.Write((ushort)0x0808);
			bw.Write((ushort)8);
			bw.Write((ushort)dosTime);
			bw.Write((ushort)dosDate);
			bw.Write((uint)0);
			bw.Write((uint)0);
			bw.Write((uint)0);
			bw.Write((ushort)name.Length);
			bw.Write((ushort)0);
			bw.Write(name);
			bw.Write(deflated);
			bw.Write((uint)0x08074B50);
			bw.Write(crc);
			bw.Write((uint)deflated.Length);
			bw.Write((uint)contents.Length);
			return ms.ToArray();
		}
	}

	public static byte[] Rebuild(CaffArchiveInfo info, Dictionary<int, byte[]> newXmlUtf8) {
		var blobs = new List<byte[]>();
		for (int i = 0; i < info.Entries.Count; i++) {
			CaffMeta m = info.Entries[i];
			if (newXmlUtf8 != null && newXmlUtf8.ContainsKey(i)) {
				byte[] zipped = Zip(newXmlUtf8[i], m.Compression);
				blobs.Add(Obfuscate(zipped, info.Key, m.Obfuscated));
			} else {
				blobs.Add(Slice(info.Data, (int)m.Start, m.Size));
			}
		}

		long blobStart = info.Entries.Count > 0 ? info.Entries[0].Start : 54;
		byte[] prefix = new byte[(int)blobStart];
		Buffer.BlockCopy(info.Data, 0, prefix, 0, (int)blobStart);

		long cursor = blobStart;
		for (int i = 0; i < info.Entries.Count; i++) {
			CaffMeta m = info.Entries[i];
			ulong encStart = XorU64((ulong)cursor, info.Key);
			WriteU64BE(prefix, m.StartPosField, encStart);
			uint encSize = XorU32((uint)blobs[i].Length, info.Key);
			WriteU32BE(prefix, m.SizePos, encSize);
			cursor += blobs[i].Length;
		}

		using (var ms = new MemoryStream()) {
			ms.Write(prefix, 0, prefix.Length);
			for (int i = 0; i < blobs.Count; i++) {
				ms.Write(blobs[i], 0, blobs[i].Length);
			}
			if (info.Trailing != null && info.Trailing.Length > 0) {
				ms.Write(info.Trailing, 0, info.Trailing.Length);
			}
			return ms.ToArray();
		}
	}
}
'@

	Add-Type -TypeDefinition $code -Language CSharp -ReferencedAssemblies @($compressionLocation, 'System')
}

function Translate-Live2DDisplayText {
	param(
		[string]$Text,
		[switch]$AsXml
	)

	$translated = Translate-JapaneseSegments -Text $Text
	if ($AsXml) {
		return Protect-XmlText -Text $translated
	}
	return $translated
}

function Translate-Live2DJsonText {
	param([string]$Text)

	$script:currentFileFieldCount = 0
	$updated = $script:jsonNameRegex.Replace($Text, {
		param($match)

		$originalEscaped = $match.Groups['value'].Value
		$original = ConvertFrom-JsonStringLiteral -Escaped $originalEscaped
		if (-not $script:japanesePresenceRegex.IsMatch([string]$original)) {
			return $match.Value
		}

		$translated = Translate-Live2DDisplayText -Text ([string]$original)
		if ($translated -ceq [string]$original) {
			return $match.Value
		}

		$script:currentFileFieldCount++
		$escaped = ConvertTo-JsonStringLiteral -Raw $translated
		return ($match.Groups['prefix'].Value + $escaped + $match.Groups['suffix'].Value)
	})

	return [pscustomobject]@{
		Text = $updated
		Changed = ($updated -cne $Text)
		Fields = $script:currentFileFieldCount
	}
}

function Translate-Live2DXmlText {
	param([string]$Text)

	$script:currentFileFieldCount = 0
	$updated = $script:xmlNameRegex.Replace($Text, {
		param($match)

		$original = $match.Groups['value'].Value
		if (-not $script:japanesePresenceRegex.IsMatch($original)) {
			return $match.Value
		}

		$translated = Translate-Live2DDisplayText -Text $original -AsXml
		if ($translated -ceq $original) {
			return $match.Value
		}

		$script:currentFileFieldCount++
		return ('<s xs.n="' + $match.Groups['field'].Value + '">' + $translated + '</s>')
	})

	return [pscustomobject]@{
		Text = $updated
		Changed = ($updated -cne $Text)
		Fields = $script:currentFileFieldCount
	}
}

function Invoke-Live2DJsonFile {
	param([string]$FilePath)

	$bytes = [System.IO.File]::ReadAllBytes($FilePath)
	$hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
	$encoding = New-Object System.Text.UTF8Encoding $hasBom
	$text = $encoding.GetString($bytes)
	$result = Translate-Live2DJsonText -Text $text
	if (-not $result.Changed) {
		return $false
	}

	$outBytes = $encoding.GetBytes($result.Text)
	[System.IO.File]::WriteAllBytes($FilePath, $outBytes)
	return $true
}

function Invoke-Live2DCaffFile {
	param([string]$FilePath)

	Initialize-CaffTypes
	$data = [System.IO.File]::ReadAllBytes($FilePath)
	$info = [CaffLive2D]::Parse($data)
	$replacements = New-Object 'System.Collections.Generic.Dictionary[int,byte[]]'
	$fieldCount = 0

	for ($i = 0; $i -lt $info.Entries.Count; $i++) {
		$meta = $info.Entries[$i]
		if (-not [CaffLive2D]::IsXmlEntry($meta)) {
			continue
		}

		$xmlBytes = [CaffLive2D]::ExtractXml($info, $meta)
		$xmlText = $script:utf8NoBom.GetString($xmlBytes)
		$result = Translate-Live2DXmlText -Text $xmlText
		if ($result.Changed) {
			$replacements.Add([int]$i, [byte[]]$script:utf8NoBom.GetBytes($result.Text))
			$fieldCount += $result.Fields
			Write-Host ("    {0}: {1} display name(s)" -f $(if ($meta.Path) { $meta.Path } else { $meta.Tag }), $result.Fields)
		}
	}

	if ($replacements.Count -eq 0) {
		return $false
	}

	$updated = [CaffLive2D]::Rebuild($info, $replacements)
	[System.IO.File]::WriteAllBytes($FilePath, $updated)
	return $true
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
			$files = Get-ChildItem -LiteralPath $rootPath -Recurse -File -ErrorAction SilentlyContinue |
				Where-Object { Test-IsLive2DTargetFile -File $_ }

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
					Extension = $file.Extension.ToLowerInvariant()
				})
			}
		} else {
			if (-not (Test-IsLive2DTargetFile -File $item)) {
				Write-Host ("Skipping unsupported file type: {0}" -f $item.FullName)
				continue
			}

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
				Extension = $item.Extension.ToLowerInvariant()
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

	Write-Host 'Targeted Live2D files: .json (display Name fields), .cmo3 / .can3 (editor display names).'
	Write-Host 'IDs, file paths, and meshes are left unchanged.'
	Write-Host ''

	Initialize-TranslationSession -ExplicitApiUrl $ApiUrl -SettingsPath $UserSettingsFile -RequestTimeoutSec $TimeoutSec

	$filePlan = Get-DragDropFilePlan -Paths $InputPaths
	if (-not $filePlan -or $filePlan.Count -eq 0) {
		throw 'No .json, .cmo3, or .can3 files were found in the dropped paths.'
	}

	$backupRoots = @{}
	$totalFiles = $filePlan.Count
	$translatedFiles = 0
	$skippedUnchanged = 0
	$failedFiles = 0

	foreach ($entry in $filePlan) {
		$backupRoots[$entry.BackupRoot.ToLowerInvariant()] = $entry.BackupRoot

		$backupDir = Split-Path $entry.BackupPath -Parent
		if (-not (Test-Path -LiteralPath $backupDir)) {
			New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
		}

		Copy-Item -LiteralPath $entry.FilePath -Destination $entry.BackupPath -Force
		Write-Host ("Processing: {0}" -f $entry.FilePath)

		try {
			$changed = $false
			if ($entry.Extension -eq '.json') {
				$changed = Invoke-Live2DJsonFile -FilePath $entry.FilePath
			} else {
				$changed = Invoke-Live2DCaffFile -FilePath $entry.FilePath
			}

			if ($changed) {
				$translatedFiles++
				Write-Host '  Updated.'
			} else {
				$skippedUnchanged++
				Write-Host '  No Japanese display names found.'
			}
		} catch {
			$failedFiles++
			Write-Host ("  ERROR: {0}" -f $_.Exception.Message)
		}
	}

	Write-Host ''
	Write-Host 'Done.'
	Write-Host 'Mode: DragDrop (Live2D)'
	Write-Host ("Live2D files found: {0}" -f $totalFiles)
	Write-Host ("Files translated: {0}" -f $translatedFiles)
	Write-Host ("Files unchanged: {0}" -f $skippedUnchanged)
	Write-Host ("Files failed: {0}" -f $failedFiles)
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

$RootDir = $RootDir.Trim('"')
if (-not (Test-Path -LiteralPath $RootDir)) {
	throw "RootDir does not exist: $RootDir"
}

switch ($Mode) {
	'DragDrop' {
		Invoke-DragDropMode
	}
	default {
		throw "Unsupported mode: $Mode"
	}
}
