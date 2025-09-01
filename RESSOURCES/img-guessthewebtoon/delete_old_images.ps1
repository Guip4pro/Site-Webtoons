# Supprime les fichiers .jpg, .jpeg, .png s'ils ont bien été convertis en .webp
# Commande : .\delete_old_images.ps1


$baseDir = "C:\xampp\htdocs\Site-Webtoons\RESSOURCES\img-guessthewebtoon"

$extensions = @("*.jpg", "*.jpeg", "*.png")
# Compteurs supprimés et gardés
$deleted = 0
$kept = 0
$keptFiles = @()                                        # tableau pour stocker les fichiers gardés

foreach ($ext in $extensions) {                         #Boucle sur chaque type d’extension
    Get-ChildItem -Path $baseDir -Recurse -Include $ext | ForEach-Object {
        $file = $_.FullName                             # chemin complet du fichier actuel
        $webpFile = [System.IO.Path]::ChangeExtension($file, ".webp")   # chemin du fichier .webp correspondant,

        if (Test-Path $webpFile) {                      # vérifie si le fichier .webp existe.
            Remove-Item $file -Force                    # Supprime le fichier original
            Write-Host "[SUPPRIMÉ] $file"
            $deleted++
        } else {
            Write-Host "[GARDÉ] $file (pas de .webp trouvé)" -ForegroundColor Yellow
            $kept++
            $keptFiles += $file                         # ajoute le fichier à la liste
        }
    }
}

Write-Host "----- Résumé -----"
Write-Host "Fichiers supprimes : $deleted"
Write-Host "Fichiers gardes    : $kept"

#  Tableau recapitulatif des fichiers gardés
if ($keptFiles.Count -gt 0) {
    Write-Host "`nListe des fichiers conservés :" -ForegroundColor Blue
    foreach ($f in $keptFiles) {
        Write-Host $f -ForegroundColor Cyan
    }
}