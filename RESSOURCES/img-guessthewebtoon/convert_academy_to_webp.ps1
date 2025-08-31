<#
.SYNOPSIS
  Convertit toutes les images .jpg/.jpeg/.png en .webp (qualité 80)
  uniquement dans genre/academy/facile et genre/academy/moyen (récursif).
#>

# ----- CONFIG -----
$Root = "genre\academy"
$Targets = @("facile","moyen")
$Quality = 80
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
    Write-Host "Erreur: 'cwebp' introuvable dans le PATH. Installe les WebP tools et ajoute cwebp.exe au PATH." -ForegroundColor Red
    exit 1
}

$allFiles = @()
foreach ($t in $Targets) {
    $dir = Join-Path $Root $t
    if (-not (Test-Path $dir)) {
        Write-Host "Attention: dossier introuvable -> $dir (skipping)" -ForegroundColor Yellow
        continue
    }
    # récupère récursivement jpg/jpeg/png
    $files = Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue |
             Where-Object { 
                 $ext = $_.Extension.ToLower()
                 $ext -in ".jpg", ".jpeg", ".png"
             }
    $allFiles += $files
}

if ($allFiles.Count -eq 0) {
    Write-Host "Aucune image .jpg/.jpeg/.png trouvée dans les dossiers ciblés. Rien à faire." -ForegroundColor Yellow
    exit 0
}

$converted = 0
$failed = 0

Write-Host "Début de la conversion de $($allFiles.Count) fichier(s)..." -ForegroundColor Cyan

foreach ($file in $allFiles) {
    $input = $file.FullName
    $output = [System.IO.Path]::ChangeExtension($input, ".webp")

    # si output existe déjà, on va l'écraser (optionnellement tu peux changer ce comportement)
    try {
        # Appel direct à cwebp. & fonctionne même si le chemin contient des espaces si cwebp est dans le PATH.
        $args = @("-q", $Quality.ToString(), "`"$input`"", "-o", "`"$output`"")
        # Utilisation d'un appel simple (plus lisible en sortie)
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
        Write-Host "[EXC] Erreur lors de la conversion de $input : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "----- Résumé -----" -ForegroundColor Green
Write-Host "Total trouvés : $($allFiles.Count)"
Write-Host "Convertis avec succès : $converted"
Write-Host "Échecs : $failed"

if ($failed -gt 0) {
    Write-Host "Vérifie que les fichiers ne sont pas verrouillés et que cwebp est bien installé." -ForegroundColor Yellow
} else {
    Write-Host "Conversion terminée sans erreur !" -ForegroundColor Green
}
