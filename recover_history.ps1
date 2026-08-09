# PowerShell script to recover uncommitted code from VS Code Local History
param (
    [string]$HistoryDir = "$env:APPDATA\Code\User\History",
    [string]$ProjectDir = $PSScriptRoot,
    [switch]$BackupExisting = $true
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " VS Code History Recovery Tool for AgriX " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Scanning history directory: $HistoryDir" -ForegroundColor Yellow
Write-Host "Target project directory:   $ProjectDir" -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path $HistoryDir)) {
    Write-Error "History directory not found at $HistoryDir"
    exit 1
}

$historyFolders = Get-ChildItem -Path $HistoryDir -Directory
Write-Host "Found $($historyFolders.Count) history folders to inspect." -ForegroundColor Gray

$recoveredFiles = @()

foreach ($folder in $historyFolders) {
    $entriesJsonPath = Join-Path $folder.FullName "entries.json"
    if (-not (Test-Path $entriesJsonPath)) { continue }

    try {
        $jsonContent = Get-Content -Path $entriesJsonPath -Raw -ErrorAction Stop | ConvertFrom-Json
        if (-not $jsonContent.resource) { continue }

        $resourceUri = [System.Uri]::UnescapeDataString($jsonContent.resource)
        
        # Normalize paths for matching
        $normalizedResource = $resourceUri -replace 'file:///', '' -replace '/', '\'
        $normalizedProject = $ProjectDir -replace '/', '\'

        # Check if the file belongs to AgriX project
        if ($normalizedResource -like "*$normalizedProject*" -or $normalizedResource -like "*Agri X*") {
            # Find the relative path inside the project
            $relIndex = $normalizedResource.IndexOf("Agri X\", [System.StringComparison]::OrdinalIgnoreCase)
            if ($relIndex -ge 0) {
                $relativePath = $normalizedResource.Substring($relIndex + 7) # length of "Agri X\"
            } else {
                # Fallback: check if src is in path
                $srcIndex = $normalizedResource.IndexOf("src\", [System.StringComparison]::OrdinalIgnoreCase)
                if ($srcIndex -ge 0) {
                    $relativePath = $normalizedResource.Substring($srcIndex)
                } else {
                    continue
                }
            }

            # Pick the entry with the latest timestamp
            $latestEntry = $jsonContent.entries | Sort-Object timestamp -Descending | Select-Object -First 1
            if ($latestEntry) {
                $sourceHistoryFile = Join-Path $folder.FullName $latestEntry.id
                if (Test-Path $sourceHistoryFile) {
                    $destPath = Join-Path $ProjectDir $relativePath
                    $timestampDate = if ($latestEntry.timestamp) { [DateTimeOffset]::FromUnixTimeMilliseconds($latestEntry.timestamp).LocalDateTime } else { (Get-Item $sourceHistoryFile).LastWriteTime }

                    $recoveredFiles += [PSCustomObject]@{
                        RelativePath      = $relativePath
                        SourceHistoryFile = $sourceHistoryFile
                        DestPath          = $destPath
                        Timestamp         = $timestampDate
                        TimestampMs       = $latestEntry.timestamp
                        EntryId           = $latestEntry.id
                        Size              = (Get-Item $sourceHistoryFile).Length
                    }
                }
            }
        }
    } catch {
        # Skip invalid JSON or corrupted files
    }
}

if ($recoveredFiles.Count -eq 0) {
    Write-Host "No AgriX history files were found." -ForegroundColor Red
    exit 0
}

# Group by relative path and keep the absolute latest version if duplicate resources exist
$uniqueRecoveries = $recoveredFiles | Group-Object RelativePath | ForEach-Object {
    $_.Group | Sort-Object TimestampMs -Descending | Select-Object -First 1
}

Write-Host "Found $($uniqueRecoveries.Count) target files in VS Code history to recover:" -ForegroundColor Green
Write-Host ""

foreach ($item in $uniqueRecoveries) {
    $destDir = Split-Path -Path $item.DestPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    # Backup existing file if requested and present
    if ($BackupExisting -and (Test-Path $item.DestPath)) {
        $backupPath = "$($item.DestPath).bak"
        Copy-Item -Path $item.DestPath -Destination $backupPath -Force
    }

    Copy-Item -Path $item.SourceHistoryFile -Destination $item.DestPath -Force

    $statusMsg = "Restored: $($item.RelativePath) (Size: $($item.Size) bytes, Timestamp: $($item.Timestamp))"
    Write-Host $statusMsg -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Recovery completed successfully!" -ForegroundColor Green
