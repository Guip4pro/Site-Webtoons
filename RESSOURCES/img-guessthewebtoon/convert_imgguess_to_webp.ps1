<#
.SYNOPSIS
  Convertit les images de img-guessthewebtoon
  Convertit toutes les images .jpg/.jpeg/.png en .webp
  Commande de lancement du script : .\convert_imgguess_to_webp.ps1

#>

# ----- CONFIG -----
$Root = "./"    # racine = dossier courant
$Quality = 70   # qualité WebP
# -------------------

function Test-Cwebp {
    try {
        $null = & cwebp -version 2>$null
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-Cwebp)) {
    Write-Host "Erreur: 'cwebp' introuvable dans le PATH." -ForegroundColor Red
    exit 1
}

# récupère tous les fichiers jpg/jpeg/png dans toute l’arborescence
$allFiles = Get-ChildItem -Path $Root -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object {
                $ext = $_.Extension.ToLower()
                $ext -in ".jpg", ".jpeg", ".png"
            }

if ($allFiles.Count -eq 0) {
    Write-Host "Aucune image trouvée. Rien à faire." -ForegroundColor Yellow
    exit 0
}

$converted = 0
$failed = 0

Write-Host "Début de la conversion de $($allFiles.Count) fichier(s)..." -ForegroundColor Cyan

foreach ($file in $allFiles) {
    $input = $file.FullName
    $output = [System.IO.Path]::ChangeExtension($input, ".webp")

    try {
        $processInfo = Start-Process -FilePath "cwebp" -ArgumentList @("-q",$Quality,$input,"-o",$output) -NoNewWindow -Wait -PassThru -ErrorAction Stop
        if ($processInfo.ExitCode -eq 0) {
            $converted++
            Write-Host "[OK] $input -> $output"
        } else {
            $failed++
            Write-Host "[ERREUR] $input (exit $($processInfo.ExitCode))" -ForegroundColor Red
        }
    } catch {
        $failed++
        Write-Host "[EXC] Erreur avec $input : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "----- Résumé -----" -ForegroundColor Green
Write-Host "Total trouvés : $($allFiles.Count)"
Write-Host "Convertis : $converted"
Write-Host "Échecs : $failed"
