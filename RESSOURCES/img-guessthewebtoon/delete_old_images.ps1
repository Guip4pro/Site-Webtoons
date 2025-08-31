# delete_old_images.ps1
# Supprime les fichiers .jpg, .jpeg, .png s'ils ont bien été convertis en .webp
# Commande : .\delete_old_images.ps1


$baseDir = "C:\xampp\htdocs\Site-Webtoons\RESSOURCES\img-guessthewebtoon"

$extensions = @("*.jpg", "*.jpeg", "*.png")
$deleted = 0
$kept = 0

foreach ($ext in $extensions) {
    Get-ChildItem -Path $baseDir -Recurse -Include $ext | ForEach-Object {
        $file = $_.FullName
        $webpFile = [System.IO.Path]::ChangeExtension($file, ".webp")

        if (Test-Path $webpFile) {
            Remove-Item $file -Force
            Write-Host "[SUPPRIMÉ] $file"
            $deleted++
        } else {
            Write-Host "[GARDÉ] $file (pas de .webp trouvé)" -ForegroundColor Yellow
            $kept++
        }
    }
}

Write-Host "----- Résumé -----"
Write-Host "Fichiers supprimes : $deleted"
Write-Host "Fichiers gardes    : $kept"
