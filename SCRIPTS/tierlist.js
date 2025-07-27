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



    // Liste pour stocker tous les liens webtoons
    const allWebtoonLinks = [];

    function loadWebtoonsFromJson(jsonFile) {
        fetch(`${jsonFile}?v=${Date.now()}`)    // Ajout du paramètre pour éviter le cache
            .then(response => response.json())
            .then(data => {
                data.categories.forEach(category => {
                    const container = document.getElementById(
                        category.name.toLowerCase()
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                            .replace(/\s+/g, '-')
                    );

                    if (container) {
                        category.webtoons.forEach(webtoon => {
                            const link = document.createElement('a');
                            link.href = `#webtoon-${webtoon.title.replace(/\s+/g, '-').toLowerCase()}-details`;     // toLowerCase convertit la chaîne de caractère en minuscule

                            // Génère une liste de tous les noms (titre + alias)
                            const aliases = [
                                webtoon.title,
                                ...(Array.isArray(webtoon.aliases) ? webtoon.aliases : [])
                            ].map(name => name.toLowerCase());

                            // Stocke les alias pour la recherche
                            link.dataset.aliases = aliases.join(',');

                            const img = document.createElement('img');
                            img.src = webtoon.image;
                            if (webtoon.loading) img.loading = webtoon.loading;
                            img.alt = webtoon.alt;

                            link.appendChild(img);
                            container.appendChild(link);

                            // 3) Sauvegarder ce lien dans la liste
                            allWebtoonLinks.push(link);
                            
                            // 4) Ajout du click handler pour le pop‑up
                            link.addEventListener('click', function (event) {
                                event.preventDefault();
                                const targetID = this.getAttribute('href').substring(1);
                                const targetDetail = document.getElementById(targetID);
                                if (targetDetail) {
                                    targetDetail.style.display = 'block';
                                    const closePopup = targetDetail.querySelector('.close-popup');      // Récupérer la croix de fermeture
                                    closePopup.onclick = () => targetDetail.style.display = 'none';     // Fermer le pop-up
                                }
                            });
                        });
                    }
                });
            })
            .catch(error => console.error('Erreur lors du chargement du JSON :', error));
    }


    
    // Appel
    loadWebtoonsFromJson('https://guip4pro.github.io/Site-Webtoons/RESSOURCES/data-json/all.json');   // ancien chemin relatif : '../RESSOURCES/data-json/all.json'

    // (Ancien système de fermeture :) Fermer le pop-up en cliquant à l'extérieur du contenu
    /*window.addEventListener('click', function(event) {
        const openPopup = document.querySelector('.webtoon-details[style*="display: block"]');
        if (openPopup && !openPopup.contains(event.target) && !event.target.matches('.tier-grid img')) {
            openPopup.style.display = 'none';
        }
    });*/





        // Filtrer au fur et à mesure de la saisie
    document.getElementById('search-webtoon').addEventListener('input', function () {
        const query = this.value.trim().toLowerCase();

        allWebtoonLinks.forEach(link => {
            const aliases = link.dataset.aliases?.split(',') || [];
            const match = aliases.some(alias => alias.includes(query));
            link.style.display = match ? '' : 'none';
        });
    });

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
