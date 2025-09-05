<?php
/**
 * Script PHP pour générer des fichiers JSON listant les images pour chaque dossier d'images.
 * 
 * Arborescence des dossiers (par rapport à ce fichier PHP) :
 *  - ./10trone
 *  - ./9-6maitre
 *  - ./5paspersoprincipal
 *  - ./4-1creatif
 *  - ./0abrutifini
 * 
 * Les fichiers JSON seront générés dans ../../data-json
 * 
 * Script à lancer dans le terminal dans le dossier characters-icons : php generate-json-characters.php
 */

// Liste des dossiers à analyser
$folders = [
    '10trone',
    '9-6maitre',
    '5paspersoprincipal',
    '4-1creatif',
    '0abrutifini'
];

// Extensions autorisées
$allowedExtensions = ['jpeg', 'jpg', 'png', 'webp', 'avif'];

// Chemin du dossier de sortie pour les JSON
$outputDir = __DIR__ . '/../../data-json/characters-php';

// S'assurer que le dossier de sortie existe
if (!is_dir($outputDir)) {
    mkdir($outputDir, 0777, true);
}

// Fonction pour récupérer les fichiers d'un dossier
function getImagesFromFolder($folderPath, $allowedExtensions) {
    $images = [];

    // Scanner le dossier
    if (is_dir($folderPath)) {
        $files = scandir($folderPath);

        foreach ($files as $file) {
            $filePath = $folderPath . '/' . $file;

            // Vérifier si c'est bien un fichier et qu'il a une extension autorisée
            if (is_file($filePath)) {
                $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($extension, $allowedExtensions)) {
                    $images[] = $file;
                }
            }
        }
    }

    return $images;
}

// Boucle sur chaque dossier pour générer un fichier JSON
foreach ($folders as $folder) {
    $folderPath = __DIR__ . '/' . $folder;

    // Récupérer la liste des images
    $images = getImagesFromFolder($folderPath, $allowedExtensions);

    // Construire le chemin complet du fichier JSON
    $jsonFilePath = $outputDir . '/' . $folder . '.json';

    // Sauvegarder la liste en JSON
    file_put_contents($jsonFilePath, json_encode($images, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    echo "✅ JSON généré : $jsonFilePath (" . count($images) . " images)\n";
}
?>
