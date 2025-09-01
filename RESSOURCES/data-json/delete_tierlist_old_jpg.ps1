<#
.SYNOPSIS
  Supprime les fichiers .jpg/.jpeg/.png uniquement si le fichier <nom>.<ext>.webp existe.
  Usage : .\delete_tierlist_old_jpg.ps1
#>

$baseDir = "C:\xampp\htdocs\Site-Webtoons\IMAGES"

$extensions = @("*.jpg", "*.jpeg", "*.png")
# Compteurs supprimés et gardés
$deleted = 0
$kept = 0
$keptFiles = @()  # tableau pour stocker les fichiers gardés

foreach ($ext in $extensions) {                                 #Boucle sur chaque type d’extension
    Get-ChildItem -Path $baseDir -Recurse -File -Include $ext -ErrorAction SilentlyContinue | ForEach-Object {
        $file = $_.FullName                                     # chemin complet du fichier actuel
        # on recherche le .webp correspondant ayant le nom complet (ex: cover.jpg.webp)
        $webpFile = "$file.webp"

        if (Test-Path $webpFile) {
            try {
                Remove-Item $file -Force
                Write-Host "[SUPPRIMÉ] $file" -ForegroundColor Green
                $deleted++
            } catch {
                Write-Host "[ERREUR SUPPR] $file : $($_.Exception.Message)" -ForegroundColor Red
                $kept++
                $keptFiles += $file
            }
        } else {
            Write-Host "[GARDÉ] $file (pas de $([System.IO.Path]::GetFileName($webpFile)) trouvé)" -ForegroundColor Yellow
            $kept++
            $keptFiles += $file
        }
    }
}

Write-Host "----- Résumé -----"
Write-Host "Fichiers supprimés : $deleted"
Write-Host "Fichiers gardés    : $kept"

# Tableau récapitulatif des fichiers gardés
if ($keptFiles.Count -gt 0) {
    Write-Host "`nListe des fichiers conservés :" -ForegroundColor Blue
    foreach ($f in $keptFiles) {
        Write-Host $f -ForegroundColor Cyan
    }
}
