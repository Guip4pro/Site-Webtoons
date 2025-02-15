// Fonction pour récupérer le JSON scroll-banners
async function fetchImages() {
    try {
        const response = await fetch("../RESSOURCES/data-json/scroll-banners.json"); // Charger le fichier JSON
        const images = await response.json(); // Convertir en objet JS
        return images;
    } catch (error) {
        console.error("Erreur lors du chargement des images :", error);
        return [];
    }
}

// Fonction mélange aléatoire
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Échange des éléments
    }
}


// Fonction pour afficher une image à la fois
async function startSlideshow() { // Déclaration de la fonction
    const images = await fetchImages(); // Appel d'une fonction (point-virgule après)
    shuffleArray(images); // Appel d'une autre fonction (point-virgule après)
  
    const container = document.getElementById("scroll-banners"); // Sélectionner le conteneur (point-virgule après)
    container.innerHTML = ""; // Vider le conteneur (point-virgule après)
  
    // Créer deux images superposées
    const img1 = document.createElement("img");  // Création de la première image
    img1.classList.add("banners-style");  // Ajout d'une classe à l'image
    container.appendChild(img1); // Ajouter l'image au conteneur
  
    const img2 = document.createElement("img");  // Création de la deuxième image
    img2.classList.add("banners-style");  // Ajout d'une classe à la deuxième image
    container.appendChild(img2);  // Ajouter l'image au conteneur
  
    let index = 0; // Initialisation de l'index
    let currentImg = img1;  // Image actuelle
    let nextImg = img2;     // Image suivante
  
    function changeImage() { // Déclaration de la fonction changeImage
        nextImg.src = images[index].src;  // Modification de la source de l'image suivante
        nextImg.alt = images[index].alt;  // Modification de l'attribut alt
        currentImg.classList.add("swipe-out");  // Effet de swipe pour l'image actuelle
        nextImg.classList.add("swipe-in");  // Effet de swipe pour la nouvelle image
    
        setTimeout(() => { // Attente de la fin de l'animation
            [currentImg, nextImg] = [nextImg, currentImg]; // Inverser les images
            currentImg.classList.remove("swipe-out"); // Retirer la classe swipe-out
            nextImg.classList.remove("swipe-in"); // Retirer la classe swipe-in
            index = (index + 1) % images.length; // Passer à l'image suivante
        }, 1500);  // Temps d'attente pour l'animation
    }
  
    // Afficher la première image et démarrer le diaporama
    currentImg.src = images[index].src;
    currentImg.alt = images[index].alt;
    index = (index + 1) % images.length;
  
    setInterval(changeImage, 10000); // Changer d'image toutes les 10 secondes
}
  
document.addEventListener("DOMContentLoaded", startSlideshow); // Lancer la fonction après que le DOM soit chargé
