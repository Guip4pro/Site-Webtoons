// Attend que tout le contenu HTML soit entièrement chargé avant d'exécuter le JS
document.addEventListener('DOMContentLoaded', function () {
    const webtoonLinks = document.querySelectorAll('.tier-grid a');
    const tierContainer = document.getElementById("intermediaires");

    
    // Ouvre un pop-up lorsque l'image est cliquée
    webtoonLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const targetID = this.getAttribute('href').substring(1);
            const targetDetail = document.getElementById(targetID);
            if (targetDetail) {
                targetDetail.style.display = 'block';
            }
        });
    });


/*
fetch('RESSOURCES/data-json/all.json')
.then(response => {
    if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    console.log('Données JSON chargées :', data);
})
.catch(error => console.error('Erreur lors du chargement du JSON :', error));
*/

function loadWebtoonsFromJson(jsonFile) {
    fetch(`${jsonFile}?v=${Date.now()}`)  // Ajout du paramètre pour éviter le cache
        .then(response => response.json())
        .then(data => {
            data.categories.forEach(category => {
                console.log("Chargement de la catégorie :", category.name);
                
                const container = document.getElementById(
                    category.name.toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/\s+/g, '-')
                );

                if (container) {
                    console.log("Conteneur trouvé pour la catégorie :", category.name);
                    
                    category.webtoons.forEach(webtoon => {
                        const link = document.createElement('a');
                        link.href = `#webtoon-${webtoon.title.replace(/\s+/g, '-').toLowerCase()}-details`;
                        const img = document.createElement('img');
                        img.src = webtoon.image;
                        if (webtoon.loading) {
                            img.loading = webtoon.loading;
                        }
                        img.alt = webtoon.alt;
                        
                        link.appendChild(img);
                        container.appendChild(link);

                        link.addEventListener('click', function (event) {
                            event.preventDefault();
                            const targetID = this.getAttribute('href').substring(1);
                            const targetDetail = document.getElementById(targetID);
                            if (targetDetail) {
                                targetDetail.style.display = 'block';

                                // Récupérer la croix de fermeture
                                const closePopup = targetDetail.querySelector('.close-popup');
                                // Ajouter un événement de clic pour fermer le pop-up
                                closePopup.onclick = function() {
                                    targetDetail.style.display = 'none'; // Fermer le pop-up
                                };
                            }
                        });
                    });
                } else {
                    console.error("Erreur : conteneur introuvable pour la catégorie :", category.name);
                }
            });
        })
        .catch(error => console.error('Erreur lors du chargement du JSON :', error));
}


    
    // Appeler la fonction pour charger les webtoons à partir du fichier JSON
    loadWebtoonsFromJson('https://guip4pro.github.io/Site-Webtoons/RESSOURCES/data-json/all.json');   // ancien chemin relatif : '../RESSOURCES/data-json/all.json'

    // (Ancien système de fermeture :) Fermer le pop-up en cliquant à l'extérieur du contenu
    /*window.addEventListener('click', function(event) {
        const openPopup = document.querySelector('.webtoon-details[style*="display: block"]');
        if (openPopup && !openPopup.contains(event.target) && !event.target.matches('.tier-grid img')) {
            openPopup.style.display = 'none';
        }
    });*/

});









    /* BARRE DE NAVIGATION LATERALE */
function toggleNav() {
    const nav = document.getElementById("sidebarNav");
    if (nav.style.width === "250px") {
        nav.style.width = "0";
    } else {
        nav.style.width = "250px";
    }
}

    /* CREER SA PROPRE TIER LIST */
function tierlistMaker() {
    alert("Fonctionnalité en cours de développement");
}




    // Zoom sur Image
// Créer le modal et ses éléments
const modal = document.createElement("div");
modal.className = "modal";
const closeModal = document.createElement("span");
closeModal.className = "close";
closeModal.innerHTML = "&times;";
const modalImg = document.createElement("img");
modalImg.className = "modal-content";

// Ajouter les éléments au modal
modal.appendChild(closeModal);
modal.appendChild(modalImg);
document.body.appendChild(modal);

// Récupérer toutes les images avec la classe "thumbnail"
const images = document.querySelectorAll(".thumbnail");

// Ajouter un événement de clic à chaque image
images.forEach(img => {
    img.onclick = function() {
        modal.style.display = "block";
        modalImg.src = this.src; // Mettre la source de l'image dans le modal
    }
});

// Lorsque l'utilisateur clique sur (x), fermer le modal
closeModal.onclick = function() {
    modal.style.display = "none";
}

// Fermer le modal si l'utilisateur clique en dehors de l'image
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
