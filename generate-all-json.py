import os
import json

# Dossier source des images
BASE_DIR = "RESSOURCES/img-guessthewebtoon/cover"
# Dossier de sortie pour les JSON
OUTPUT_DIR = "RESSOURCES/json-guessthewebtoon"

# Crée le dossier de sortie s'il n'existe pas
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Parcourt tous les dossiers dans le dossier "cover"
for subfolder in os.listdir(BASE_DIR):
    subfolder_path = os.path.join(BASE_DIR, subfolder)

    if os.path.isdir(subfolder_path):
        image_list = []

        for filename in os.listdir(subfolder_path):
            if filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".avif")):
                image_path = os.path.join(subfolder_path, filename)
                image_name = os.path.splitext(filename)[0]

                image_data = {
                    "name": image_name,
                    "image": image_path.replace("\\", "/")  # Pour que le chemin fonctionne dans les URLs
                }

                image_list.append(image_data)

        # Crée le fichier JSON correspondant au sous-dossier
        json_filename = f"cover-{subfolder}.json"
        json_path = os.path.join(OUTPUT_DIR, json_filename)

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(image_list, f, indent=4, ensure_ascii=False)

        print(f"✅ Fichier JSON généré : {json_filename} ({len(image_list)} images)")

# Commande : python generate-all-json.py
