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
                console.log("JSON chargé :", data);     // Afficher le contenu entier du json
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

    // Fonction texte sites de lecture petit-écran
    (function() {
        const BREAKPOINT = 720; // px -> adapte si tu veux
        let resizeTimer = null;

        function syncSitesForAllPopups() {
            document.querySelectorAll('.webtoon-details').forEach(popup => {
            const detailsContent = popup.querySelector('.details-content');
            const detailsText = popup.querySelector('.details-text');
            if (!detailsContent || !detailsText) return;

            const orig = popup.querySelector('.sites-container');   // élément original (dans details-text)
            const mobile = popup.querySelector('.sites-mobile');    // élément mobile (après details-content)

            // --- mobile view ---
            if (window.innerWidth <= BREAKPOINT) {
                // si déjà déplacé, on s'assure qu'il y a bien un .sites-mobile
                if (!mobile) {
                // si orig existe -> on conserve son contenu, puis on le retire et on crée mobile
                if (orig) {
                    // stocker le HTML + class dans dataset pour restauration future
                    popup.dataset.sitesOriginalInner = orig.innerHTML;
                    popup.dataset.sitesOriginalClass = orig.className || 'sites-container';
                    // retirer l'original (suppression comme demandé)
                    orig.remove();
                }
                // créer le bloc mobile (à partir de la copie stockée si possible)
                const newMobile = document.createElement('div');
                newMobile.className = 'sites-mobile';
                newMobile.innerHTML = popup.dataset.sitesOriginalInner || '<p class="sites-list"><strong>Sites de lecture :</strong></p>';
                // insérer juste en-dessous de .details-content
                detailsContent.parentNode.insertBefore(newMobile, detailsContent.nextSibling || null);
                }
                // sinon mobile déjà présent -> rien à faire
                return;
            }

            // --- desktop view (restauration) ---
            if (window.innerWidth > BREAKPOINT) {
                // si mobile existe -> supprimer
                if (mobile) mobile.remove();

                // si original absent mais on a le contenu stocké -> recréer dans details-text
                if (!orig && popup.dataset.sitesOriginalInner) {
                const restored = document.createElement('div');
                restored.className = popup.dataset.sitesOriginalClass || 'sites-container';
                restored.innerHTML = popup.dataset.sitesOriginalInner;
                detailsText.appendChild(restored);
                // on laisse les dataset au cas où (utile si on veut toggler plusieurs fois)
                }
            }
            });
        }

        // appel initial
        document.addEventListener('DOMContentLoaded', syncSitesForAllPopups);

        // resize (debounced)
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(syncSitesForAllPopups, 120);
        });

        // si tu ajoutes dynamiquement des .webtoon-details (via le JSON), on observe et on relance
        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
            if ([...m.addedNodes].some(n => n.nodeType === 1 && n.matches && n.matches('.webtoon-details'))) {
                setTimeout(syncSitesForAllPopups, 60);
                break;
            }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Exécution immédiate si le DOM est déjà prêt (utile si le script est chargé après DOMContentLoaded)
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            setTimeout(syncSitesForAllPopups, 30);
        }
    })();

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




document.addEventListener('DOMContentLoaded', () => {
    // Formulaire
    const form = document.querySelector('.contact-form');
    const inputs = document.querySelectorAll(".contact-form input[maxlength], .contact-form textarea[maxlength]");

    // Initialise les compteurs de caractères
    const countersMap = new Map();

    inputs.forEach(input => {
        const max = input.getAttribute("maxlength");
        // On cherche un <p> avec la classe .char-count dans le parent
        const counter = input.parentElement.querySelector("p.char-count");
        if (counter) {
            const updateCount = () => {
                const remaining = max - input.value.length;
                counter.textContent = `Caractères restants : ${remaining}`;
            };
            input.addEventListener("input", updateCount);
            updateCount();  // Initialisation

            // Sauvegarde la fonction pour réutilisation après reset
            countersMap.set(input, updateCount);
        }
    });


    // Gestion de la soumission du formulaire
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log('🟢 submit event fired');

        const formData = new FormData(form);
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            console.log('Fetch response:', response);

            if (response.ok) {
                console.log('✅ Envoi réussi');
                form.reset();

                // Forcer la mise à jour des compteurs après reset
                countersMap.forEach((updateCount, input) => updateCount());

                // Affichage du popup
                const popup = document.getElementById('popup-message');
                popup.classList.add('popup-visible');

                setTimeout(() => {
                    popup.classList.remove('popup-visible');
                }, 3000);
            } else {
                console.error('❌ Envoi échoué, status:', response.status);
                alert("Une erreur s'est produite. Statut : " + response.status);
            }
        } catch (err) {
            console.error('🚨 Erreur fetch():', err);
            alert("Erreur réseau : vérifie la console");
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form');
    const inputs = form.querySelectorAll("input[maxlength], textarea[maxlength]");
    const countersMap = new Map();

    inputs.forEach(input => {
        const max = parseInt(input.getAttribute("maxlength"), 10);

        // on remonte au .form-group parent, puis on y cherche le .char-count
        const group   = input.closest('.form-group');
        const counter = group?.querySelector('.char-count');

        if (counter) {
        const updateCount = () => {
            const remaining = max - input.value.length;
            counter.textContent = `Caractères restants : ${remaining}`;
        };
        input.addEventListener('input', updateCount);
        updateCount();  // initialisation
        countersMap.set(input, updateCount);
        }
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
        const res = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
            form.reset();
            // on rafraîchit tous les compteurs
            countersMap.forEach(fn => fn());
            const popup = document.getElementById('popup-message');
            popup.classList.add('popup-visible');
            setTimeout(() => popup.classList.remove('popup-visible'), 3000);
        } else {
            alert("Erreur d'envoi (status " + res.status + ")");
        }
        } catch {
        alert("Erreur réseau, vois la console");
        }
    });

});
