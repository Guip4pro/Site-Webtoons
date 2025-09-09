<#
.SYNOPSIS
  Script de CONVERSION de toutes les images de la tier-list
  Convertit toutes les images .jpg/.jpeg/.png en .webp (nom de sortie : <nomfichier>.webp)
  Usage : .\tierlist_to_webp.ps1 dans data-json
#>

# ----- CONFIG -----
# chemin racine (relatif au dossier courant ou absolute). Exemple: "../../IMAGES"
$Root = "../../IMAGES"
$Quality = 70   # qualité WebP (0-100)
$Overwrite = $false  # true pour forcer l'écrasement des .webp existants
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
    # Sortie : on garde l'extension d'origine dans le nom -> évite les collisions
    # ex: C:\...\cover.jpg  -> C:\...\cover.jpg.webp
    $output = [System.IO.Path]::ChangeExtension($input, ".webp")

    # si existant et pas d'overwrite -> on skip
    if ((Test-Path $output) -and (-not $Overwrite)) {
        Write-Host "[SKIP] $output existe déjà" -ForegroundColor DarkYellow
        continue
    }

    try {
        # utilisation de l'opérateur & pour bien gérer les chemins contenant des espaces
        & cwebp -q $Quality "$input" -o "$output"
        if ($LASTEXITCODE -eq 0) {
            $converted++
            Write-Host "[OK] $input -> $output"
        } else {
            $failed++
            Write-Host "[ERREUR] $input (exit $LASTEXITCODE)" -ForegroundColor Red
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
