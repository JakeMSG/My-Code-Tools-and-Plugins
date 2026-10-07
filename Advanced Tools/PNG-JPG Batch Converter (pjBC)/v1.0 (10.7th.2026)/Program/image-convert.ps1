$ErrorActionPreference = 'Stop'

function Get-PrefixedPath([string]$path) {
    if ($path.StartsWith('\\?\')) { return $path }
    $full = $path
    try { $full = [System.IO.Path]::GetFullPath($path) } catch {}
    if ($full.StartsWith('\\?\UNC\')) { return $full }
    if ($full.StartsWith('\\?\')) { return $full }
    if ($full.StartsWith('\\')) { return '\\?\UNC\' + $full.Substring(2) }
    return '\\?\' + $full
}

function Read-FileBytes([string]$path) {
    $lastError = $null
    foreach ($candidate in @($path, (Get-PrefixedPath $path))) {
        try { return [System.IO.File]::ReadAllBytes($candidate) } catch { $lastError = $_ }
    }
    throw $lastError
}

function Write-FileBytes([string]$path, [byte[]]$bytes) {
    $lastError = $null
    foreach ($candidate in @($path, (Get-PrefixedPath $path))) {
        try {
            [System.IO.File]::WriteAllBytes($candidate, $bytes)
            return
        } catch { $lastError = $_ }
    }
    throw $lastError
}

function Get-JpegCodec() {
    foreach ($codec in [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()) {
        if ($codec.MimeType -eq 'image/jpeg') { return $codec }
    }
    throw 'JPEG encoder is not available.'
}

try {
    Add-Type -AssemblyName System.Drawing
    $src = $env:CONV_SRC
    $dst = $env:CONV_DST
    $mode = $env:CONV_MODE
    if ([string]::IsNullOrWhiteSpace($src) -or [string]::IsNullOrWhiteSpace($dst)) {
        throw 'Missing source or destination path.'
    }

    $bytes = Read-FileBytes $src
    $ms = New-Object System.IO.MemoryStream(, $bytes)
    try {
        $img = [System.Drawing.Image]::FromStream($ms, $false, $true)
        try {
            $out = New-Object System.IO.MemoryStream
            try {
                if ($mode -eq 'png2jpg') {
                    $quality = 0
                    if (-not [int]::TryParse($env:CONV_QUALITY, [ref]$quality) -or $quality -lt 0 -or $quality -gt 100) {
                        throw 'JPG quality must be a whole number from 0 to 100.'
                    }
                    $bmp = New-Object System.Drawing.Bitmap $img.Width, $img.Height
                    try {
                        if ($img.HorizontalResolution -gt 0 -and $img.VerticalResolution -gt 0) {
                            $bmp.SetResolution($img.HorizontalResolution, $img.VerticalResolution)
                        }
                        $g = [System.Drawing.Graphics]::FromImage($bmp)
                        try {
                            $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
                            $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
                            $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
                            $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
                            $g.Clear([System.Drawing.Color]::White)
                            $destRect = New-Object System.Drawing.Rectangle 0, 0, $img.Width, $img.Height
                            $g.DrawImage($img, $destRect)
                        } finally {
                            $g.Dispose()
                        }
                        $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
                        $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, ([int64]$quality))
                        $bmp.Save($out, (Get-JpegCodec), $ep)
                    } finally {
                        $bmp.Dispose()
                    }
                } elseif ($mode -eq 'jpg2png') {
                    $img.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
                } else {
                    throw "Unknown conversion mode: $mode"
                }
                Write-FileBytes $dst $out.ToArray()
            } finally {
                $out.Dispose()
            }
        } finally {
            $img.Dispose()
        }
    } finally {
        $ms.Dispose()
    }
    exit 0
} catch {
    $msg = $_.Exception.Message
    if ($msg -match 'Parameter is not valid' -or $_.Exception -is [System.OutOfMemoryException]) {
        $msg = 'Could not read the image. The file may be damaged or use an unsupported pixel format.'
    }
    [Console]::Error.WriteLine($msg)
    exit 1
}
