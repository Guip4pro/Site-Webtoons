#!/usr/bin/env python3
import os
import json
import re

# ---------- CONFIG ----------
ROOT_DIR = "RESSOURCES/img-guessthewebtoon"        # racine contenant cover/, genre/, ...
OUTPUT_DIR = "RESSOURCES/data-json/guess-webtoon-py"
IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".webp", ".avif")
GENERATE_INDEX = True   # crée un index.json listant tous les fichiers générés
# ----------------------------

os.makedirs(OUTPUT_DIR, exist_ok=True)

def slugify(parts):
    """
    Convertit une liste de parties (['genre','academy','facile']) → 'genre-academy-facile'
    enlève ou remplace caractères problématiques, met en minuscule.
    """
    s = "-".join(parts)
    s = s.replace(" ", "-")
    # garde lettres, chiffres, -, _
    s = re.sub(r"[^a-zA-Z0-9\-_]", "", s)
    return s.lower()

generated = []  # pour index

# Parcourt chaque dossier de premier niveau (cover, genre, ...)
for top in sorted(os.listdir(ROOT_DIR)):
    top_path = os.path.join(ROOT_DIR, top)
    if not os.path.isdir(top_path):
        continue

    # walk récursif dans ce top-level
    for dirpath, dirnames, filenames in os.walk(top_path):
        # ignore dossiers cachés (optionnel)
        if os.path.basename(dirpath).startswith('.'):
            continue

        images = [f for f in filenames if f.lower().endswith(IMAGE_EXTS)]
        if not images:
            continue  # pas d'images ici → rien à générer

        # rel_path par rapport au dossier top (ex: 'academy/facile' ou '.')
        rel = os.path.relpath(dirpath, top_path)
        parts = [top]
        if rel != ".":
            parts.extend(rel.split(os.sep))

        json_slug = slugify(parts)                 # ex: 'genre-academy-facile'
        json_filename = f"{json_slug}.json"
        json_path = os.path.join(OUTPUT_DIR, json_filename)

        image_list = []
        for fname in sorted(images):
            image_path = os.path.join(dirpath, fname)
            name = os.path.splitext(fname)[0]
            # normalise les antislashs pour URLs
            web_path = image_path.replace("\\", "/")
            image_list.append({
                "name": name,
                "image": web_path
            })

        # écriture du JSON (utf-8)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(image_list, f, indent=4, ensure_ascii=False)

        generated.append({
            "json": json_filename,
            "category": top,
            "relative_folder": rel.replace("\\", "/"),
            "count": len(image_list),
            "path": json_path.replace("\\", "/")
        })

        print(f"✅ Generated {json_filename} — {len(image_list)} images")

# optionnel : écrire un index.json regroupant tout
if GENERATE_INDEX:
    index_path = os.path.join(OUTPUT_DIR, "index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(generated, f, indent=4, ensure_ascii=False)
    print(f"📚 Index generated: {os.path.basename(index_path)} ({len(generated)} files)")

# commande : python generate-all-json.py