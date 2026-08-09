
function startGuessTheWebtoon() {
    const gameContainer = document.getElementById('memory-game');
    gameContainer.classList.add('hidden');
    gameContainer.classList.remove('fade-in');
    document.getElementById('memory-difficulty-selector').classList.add('hidden');
    document.getElementById('memory-stats').classList.add('hidden');
    document.getElementById('leaderboard-section').classList.add('hidden');
    document.getElementById('phr-temp').classList.toggle('hidden')
    document.getElementById('bannière').src = "../RESSOURCES/scrolling-banners/banner3.jpg";
    const ScrollAccordion = document.querySelector('.accordion-container');
    ScrollAccordion.classList.toggle('hidden');

        // API pour centrer le plateau de jeu
    ScrollAccordion.scrollIntoView({
        behavior: 'smooth',   // défilement animé
        block:    'center',   // centre verticalement
        inline:   'nearest'   // pas de décalage horizontal
    });


        // Si la fonction existe (par sécurité), on stoppe les sons du Memory
    if (typeof stopAllMemorySounds === 'function') {
        stopAllMemorySounds();
    }

        // Arrêt du chrono / compte à rebours
    if (typeof stopAllMemoryTimers === 'function') {
        stopAllMemoryTimers();
    } else {
        // Sécurité si la fonction n’est pas encore chargée
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        document.getElementById('memory-countdown').classList.add('hidden');
    }
}


// Accordéons principaux
const accordions = document.querySelectorAll('.accordion');

accordions.forEach((acc) => {
    // sauvegarder le label original (évite les slice fragile)
    const label = acc.textContent.trim();
    acc.dataset.label = label;

    // Ajout de la flèche initiale
    acc.textContent = `▸ ${label}`;

    acc.addEventListener('click', () => {
        acc.classList.toggle('active');
        const panel = acc.nextElementSibling;
        const isOpen = panel.style.display === 'flex';

        // toggle visuel
        panel.style.display = isOpen ? 'none' : 'flex';
        acc.textContent = isOpen ? `▸ ${acc.dataset.label}` : `▾ ${acc.dataset.label}`;

        // si on vient d'ouvrir, scroller pour centrer l'accordion
        if (!isOpen) {
        acc.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        }
    });
});


// Sous-accordéons
const subAccordions = document.querySelectorAll('.sub-accordion');

subAccordions.forEach((accordion) => {
    accordion.addEventListener('click', () => {
        accordion.classList.toggle('active');
        const panel = accordion.nextElementSibling;
        if (panel) {
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        }
    });
});

// Bouton Générations : génère un texte temporaire puis revient au texte d'origine
const genDate = document.getElementById('gen-date');
let timeoutId = null; // Pour stocker l'identifiant du setTimeout en cours

genDate.addEventListener('click', () => {
    const originalText = "Générations"; // texte de base du bouton

    // Si un timeout est déjà en cours, on l'annule
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
        genDate.textContent = originalText; // réinitialise immédiatement
        return; // on sort de la fonction (clic sert juste à réinitialiser)
    }

    // Sinon, on génère un texte
    genDate.textContent = "Générations (date de la version d'origine)";

    // On programme la réinitialisation après 15 secondes
    timeoutId = setTimeout(() => {
        genDate.textContent = originalText;
        timeoutId = null; // reset
    }, 6000);
});


// Commencer le jeu
document.addEventListener('DOMContentLoaded', () => {
    console.log("Script chargé ✅");
    const startBtn = document.getElementById('start-gtw');
    if (startBtn) startBtn.addEventListener('click', () => startGuessTheWebtoon());


    let lastClickedEl = null;

    // Initialise la pop-up (et sa fonction globale)
    initGuessTheWebtoonPopup();


    document.querySelectorAll('.scroll-item').forEach(item => {
        item.addEventListener('click', () => {
            console.log("Tu as cliqué sur :", item.textContent.trim());
            lastClickedEl = item; // sauvegarde l’élément cliqué
            handleScrollItemClick(item);
        });
    });

    function handleScrollItemClick(el) {
        // Récupère les infos stockées dans les data-attributes
        const category = el.dataset.category; // "cover" ou "genre"
        const sub = el.dataset.sub;           // "academy" (facultatif)
        const diff = el.dataset.diff || el.textContent.trim(); // fallback. En gros si pas de data-diff, prend le nom du div

        // Debug
        console.log("Handler -> category:", category, "sub:", sub, "difficulty:", diff);

        // Sauvegarde l'élément cliqué pour que le bouton JOUER sache quoi lancer
        lastClickedEl = el;

        // Ouvre la popup (affiche la difficulté choisie)
        // showGuessTheWebtoonPopup doit accepter un argument difficulty à afficher
        if (typeof showGuessTheWebtoonPopup === "function") {
            showGuessTheWebtoonPopup(diff);
        } else {
            // fallback: si la popup n'existe pas, lance directement le jeu (au cas où)
            // mais normalement on ne devrait pas arriver ici
            if (sub) startGuessTheWebtoonGame(category, sub, diff);
            else startGuessTheWebtoonGame(category, diff);
        }
    }




    function initGuessTheWebtoonPopup() {
        const category1Sound = new Audio('../RESSOURCES/sounds/569902__bigdino1995__buttonpress.wav');
        const btnJouerSound = new Audio('../RESSOURCES/sounds/transition-base-new.m4a');
        /** 762132
        * Catégorie :                    569902
        * Jouer, Rejouer et Partager :   transition-base-new.m4a / beep-6
        * Bonne réponse :                correct-choice-43861.mp3 / 656393 / beep-6 / 656394
        * Mauvaise réponse :             351563__bertrof__game-sound-incorrect-with-delay.wav / 476177
        * Fin de jeu :                   notification-beep-229154.mp3 / success-48 / level-passed / brass-new / 656304 / 264981
        *
        */
        // On déclare la fonction globale ici
        window.showGuessTheWebtoonPopup = function(difficulty = "Facile") {
            // Ne crée pas la pop-up si elle existe déjà
            if (document.querySelector('.gtw-popup')) return;

            // Créer l’overlay
            const overlay = document.createElement('div');
            overlay.className = 'gtw-overlay';

            // Créer la pop-up principale
            const popup = document.createElement('div');
            popup.className = 'gtw-popup';

            // En-tête
            const header = document.createElement('div');
            header.className = 'gtw-header';
            header.innerHTML = `
                <h2>Devine le Webtoon</h2>
                <span class="gtw-close">&times;</span>
            `;
            popup.appendChild(header);

            // Difficulté
            const diffDisplay = document.createElement('div');
            diffDisplay.className = `gtw-difficulty gtw-${difficulty.toLowerCase()}`;
            diffDisplay.textContent = `Difficulté : ${difficulty}`;
            popup.appendChild(diffDisplay);

            // Bloc consigne avec mascotte
            const instructions = document.createElement('div');
            instructions.className = 'gtw-instructions';
            instructions.innerHTML = `
                <img src="../RESSOURCES/icons/icon3-consigne.jpg" alt="Mascotte" class="gtw-mascotte" />
                <div class="gtw-text">
                    <strong>Prêt à tester tes connaissances ?</strong><br>
                    Tu auras <strong>15s</strong> pour retrouver le nom du <strong>webtoon</strong> correspondant à l'image parmi 4 propositions.
                </div>
            `;
            popup.appendChild(instructions);

            // Exemple visuel
            const example = document.createElement('div');
            example.className = 'gtw-example';
            example.innerHTML = `
                <div class="gtw-example-title">Exemple :</div>
                <div class="gtw-example-images">
                    <img src="../RESSOURCES/img-guessthewebtoon/characters-icons/exemple_flou.webp" class="gtw-example-image" alt="Exemple flou" />
                    <img src="../RESSOURCES/img-guessthewebtoon/characters-icons/READY.webp" class="gtw-ready-image" alt="Prêt" />
                </div>
            `;
            popup.appendChild(example);


            // Bouton "JOUER"
            const playButton = document.createElement('button');
            playButton.className = 'gtw-start-button';
            playButton.textContent = 'JOUER';
            popup.appendChild(playButton);


            // Ajout à la page
            overlay.appendChild(popup);
            document.body.appendChild(overlay);

            category1Sound.play().catch(() => {});

            // Animation d’apparition
            setTimeout(() => popup.classList.add('gtw-visible'), 10);

            // Fermeture
            overlay.querySelector('.gtw-close').addEventListener('click', () => {
                overlay.remove();
            });

            // Démarrage du jeu
            playButton.addEventListener('click', () => {
                btnJouerSound.play().catch(() => {});
                overlay.remove();

                if (lastClickedEl) {
                    const category = lastClickedEl.dataset.category;
                    const sub = lastClickedEl.dataset.sub;
                    const diff = lastClickedEl.dataset.diff ?? lastClickedEl.textContent.trim();    // ?? est comme un "ou" mais différent de || car il ne considère pas "" comme une valeur vide

                    console.log('Play pressed -> launching', { category, sub, diff });

                    if (sub) startGuessTheWebtoonGame(category, sub, diff);
                    else startGuessTheWebtoonGame(category, diff);
                } else {
                    // fallback : si rien n'a été cliqué, lance un jeu par défaut
                    startGuessTheWebtoonGame('cover', 'facile');
                }
            });
        };
    }



    /* ---------------------------
    UTILITAIRE : résout le chemin d'image
    - Si le chemin commence par http ou / : on l'utilise tel quel
    - Sinon on le transforme en chemin à partir de la racine : "/RESSOURCES/..."
    (tu peux adapter selon ta structure serveur si besoin)
    --------------------------- */
    // Fonction pour formater les titres
    function formatTitle(str) {
    if (!str) return '';
    return str
        .replace(/-/g, ' ') // Remplacement les tirets par des espaces
        .replace(/\b\w/g, l => l.toUpperCase()); // Met première lettre de chaque mot en majuscule
    }

    /* ---------------------------
    UTILITAIRE : résout le chemin d'image
    - Si le chemin commence par http ou / : on l'utilise tel quel
    - Sinon on le transforme en chemin à partir de la racine : "/RESSOURCES/..."
    --------------------------- */
    function resolveImagePath(imgPath) {
    if (!imgPath) return '';
    imgPath = String(imgPath).replace(/^\/+/, ''); // retire slash de début
    if (imgPath.startsWith('http')) return imgPath;
    return '../' + imgPath; // chemin absolu à partir de la racine du site
    }

    /* ---------------------------
    Renvoie le message final selon le score (0..10)
    --------------------------- */
    function getEndMessage(score) {
    if (score === 10) return "Le trône des Webtoons est à toi 👑";
    if (score >= 6 && score <= 9) return "Félicitations ! Tu es un maître des Webtoons 🔥";
    if (score === 5) return "Pas mal… mais t’es pas encore le personnage principal !";
    if (score >= 1 && score <= 4) return "Tes réponses étaient… créatives 😏";
    return "Tu viens de débloquer l’achievement : 'Je n’ai rien compris' 🏆";
    }



// Fonction utilitaire pour récupérer un JSON et choisir une image aléatoire
async function getRandomImageFromJson(jsonPath, folderPath) {
    try {
        const response = await fetch(jsonPath);
        if (!response.ok) throw new Error(`Erreur chargement ${jsonPath}`);
        const images = await response.json();
        if (!images.length) throw new Error(`Aucune image dans ${jsonPath}`);

        const randomIndex = Math.floor(Math.random() * images.length);
        const imageName = images[randomIndex];
        return `${folderPath}/${imageName}`;
    } catch (error) {
        console.error(error);
        return null;  // fallback si erreur
    }
}

// Fonction async principale pour récupérer l'image selon le score
async function selectCharacterImage(score) {
    if (score === 10) {
        return await getRandomImageFromJson(
        '../RESSOURCES/data-json/characters-php/10trone.json',
        'RESSOURCES/img-guessthewebtoon/characters-icons/10trone'
        );
    } else if (score >= 6 && score <= 9) {
        return await getRandomImageFromJson(
        '../RESSOURCES/data-json/characters-php/9-6maitre.json',
        'RESSOURCES/img-guessthewebtoon/characters-icons/9-6maitre'
        );
    } else if (score === 5) {
        return await getRandomImageFromJson(
        '../RESSOURCES/data-json/characters-php/5paspersoprincipal.json',
        'RESSOURCES/img-guessthewebtoon/characters-icons/5paspersoprincipal'
        );
    } else if (score >= 1 && score <= 4) {
        return await getRandomImageFromJson(
        '../RESSOURCES/data-json/characters-php/4-1creatif.json',
        'RESSOURCES/img-guessthewebtoon/characters-icons/4-1creatif'
        );
    } else {
        return await getRandomImageFromJson(
        '../RESSOURCES/data-json/characters-php/0abrutifini.json',
        'RESSOURCES/img-guessthewebtoon/characters-icons/0abrutifini'
        );
    }
}

    /* ---------------------------
    Crée une animation courte de confettis (éléments DOM + CSS keyframes)
    - popupEl : le container de la pop-up pour y ajouter les confettis
    - duration ms
    --------------------------- */

    function createConfetti(duration = 1600) {
        // crée le container global
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'gtw-confetti-container gtw-confetti-global';
        document.body.appendChild(confettiContainer);

        const count = 40;
        for (let i = 0; i < count; i++) {
            const c = document.createElement('div');
            c.className = 'gtw-confetti';
            // position horizontale
            c.style.left = `${Math.random() * 100}%`;
            // taille variante
            const s = 6 + Math.random() * 12;
            c.style.width = `${s}px`;
            c.style.height = `${Math.max(8, s + 4)}px`;
            // décalage d'animation
            c.style.animationDelay = `${Math.random() * 400}ms`;
            // rotation initiale aléatoire
            c.style.transform = `rotate(${Math.random() * 360}deg)`;
            confettiContainer.appendChild(c);
        }

        // suppression automatique
        setTimeout(() => {
            confettiContainer.classList.add('gtw-confetti--hide');
            setTimeout(() => {
            if (confettiContainer && confettiContainer.parentNode) confettiContainer.parentNode.removeChild(confettiContainer);
            }, 600);
        }, duration);
    }




// Construit le chemin du JSON (path) en fonction de plusieurs parties (parts)
function buildGuessJsonPath(...parts) {
    const slug = parts.map(p => slugPart(p)).filter(Boolean).join("-");
    return `../RESSOURCES/data-json/guess-webtoon-py/${slug}.json`;
}

// Nettoie une partie de chemin (slug)
function slugPart(str) {
    return String(str)
        .normalize("NFD")        // enlève les accents
        .replace(/[\u0300-\u036f]/g, "") // supprime diacritiques
        .toLowerCase()
        .replace(/\s+/g, "-")    // espaces -> tirets
        .replace(/[^a-z0-9\-]/g, ""); // supprime tout ce qui n’est pas alphanumérique ou tiret
}

/**
 * startGuessTheWebtoonGame(...)
 * - Usage explicite multi-catégorie :
 *     startGuessTheWebtoonGame('cover', 'facile')   // -> cover-facile.json
 *     startGuessTheWebtoonGame('genre','academy','facile') // -> genre-academy-facile.json
 */
async function startGuessTheWebtoonGame(/* variable args */) {
    // On récupère tous les arguments passés à la fonction sous forme de tableau
    const args = Array.from(arguments);
    let parts = [];

// === CAS 1 : Aucun argument passé ===
if (args.length === 0) {
    // Si aucun argument n’est donné, on définit une valeur par défaut :
    parts = ['cover', 'facile'];

    // === CAS 2 : Un seul argument passé ===
    } else if (args.length === 1) {
        // On récupère cet argument unique
        const only = args[0];

        // --- Cas 2a : si c’est déjà un tableau
        if (Array.isArray(only)) {
            // On l’utilise directement comme valeur de "parts"
            parts = only;

        // --- Cas 2b : si c’est une chaîne de caractères
        } else if (typeof only === 'string') {
            // On nettoie la chaîne en supprimant les espaces inutiles au début/fin
            const s = only.trim();

            // Si la chaîne contient un tiret (-), on suppose que c’est un "slug"
            // Exemple : "genre-academy-facile"
            if (s.includes('-')) {
                // On découpe la chaîne en morceaux sur chaque tiret
                // Exemple : "genre-academy-facile" -> ["genre", "academy", "facile"]
                // On enlève aussi les espaces autour de chaque morceau (p.trim())
                // et on filtre les éventuels morceaux vides (filter(Boolean)).
                parts = s.split('-').map(p => p.trim()).filter(Boolean);

            } else {
                // Sinon, pour rester compatible avec un ancien comportement :
                // Exemple : "facile" devient ["cover", "facile"]
                parts = ['cover', s];
            }

        // --- Cas 2c : si l’argument n’est ni tableau ni string
        } else {
            // On lève une erreur car le type n’est pas reconnu
            throw new Error('Invalid argument to startGuessTheWebtoonGame');
        }
    } else {
        // plusieurs arguments passés séparément
        parts = args;
    }

    // DEBUG: affichage utile pour vérifier ce qu'on construit
    const filePath = buildGuessJsonPath(...parts);
    console.debug('startGuessTheWebtoonGame -> parts:', parts, ' filePath:', filePath);

    const diffKey = slugPart(parts[parts.length - 1]);

    if (document.querySelector('.gtw-overlay-game')) {
        console.warn('Le jeu est déjà en cours.');
        return;
    }

    // Chargement JSON
    let data;
    try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText} (tried ${filePath})`);
        data = await res.json();
    } catch (err) {
        console.error('Erreur de chargement du JSON :', err);
        alert(`Impossible de charger les questions pour cette catégorie (${filePath}). Vérifie que le fichier existe et le chemin.`);
        return;
    }

    if (!Array.isArray(data) || data.length < 1) {
        console.error('JSON vide ou mal formé', filePath);
        alert('Pas de données disponibles pour cette catégorie.');
        return;
    }

    const gameState = {
        categoryParts: parts.slice(),
        difficulty: diffKey,
        data,
        remaining: Array.from({ length: data.length }, (_, i) => i),
        total: Math.min(10, data.length),
        current: 1,
        streak: 0,
        maxStreak: 0,
        correctCount: 0,
        answered: false
    };

    console.log('Game started with', filePath, gameState);



    // Ex: appelle ici ta fonction qui construit l'UI à partir de gameState.data
    // initGameUI(gameState);

        const goodSound = new Audio('../RESSOURCES/sounds/beep-6-96243.mp3');
        const badSound = new Audio('../RESSOURCES/sounds/476177__unadamlar__wrong-choice.wav');
        const btnJouerSound = new Audio('../RESSOURCES/sounds/transition-base-new.m4a');    // btn jouer / rejouer notification-beep-229154.mp3
        const endWinSound = new Audio('../RESSOURCES/sounds/brass-new-level-151765.mp3');    // Pop-up de fin de jeu
        const endLooseSound = new Audio('../RESSOURCES/sounds/656394__nikos34__select-2.wav');    // Pop-up de fin de jeu
        const shareSound = new Audio ('../RESSOURCES/sounds/share-sound.m4a');   // Btn partager



        // Création de l'UI
        const overlay = document.createElement('div');
        overlay.className = 'gtw-overlay-game';

        const popup = document.createElement('div');
        popup.className = 'gtw-popup-game';

        // Header (le h2 sera mis à jour dynamiquement)
        const header = document.createElement('div');
        header.className = 'gtw-header';
        header.innerHTML = `
            <h2 class="gtw-title">Devine le Webtoon</h2>
            <span class="gtw-close" title="Fermer">&times;</span>
        `;
        popup.appendChild(header);

        header.querySelector('.gtw-close').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        // Difficulty display (on garde visible également à l'écran final)
        const diffBox = document.createElement('div');
        diffBox.className = `gtw-difficulty gtw-${gameState.difficulty}`;
        diffBox.textContent = `Difficulté : ${formatTitle(gameState.difficulty)}`;
        popup.appendChild(diffBox);

        // Scoreboard (NE PAS toucher la structure, on la garde)
        const board = document.createElement('div');
        board.className = 'gtw-scoreboard';
        board.innerHTML = `
            <div class="gtw-progress"><div class="gtw-progress-bar" style="width:0%"></div></div>
            <div class="gtw-info">Question 1/${gameState.total}</div>
            <div class="gtw-streak">🔥 Streak : <span>0</span></div>
        `;
        popup.appendChild(board);

        // Image mystère
        const img = document.createElement('img');
        img.className = 'gtw-question-image';
        img.id = 'gtw-image';
        img.alt = 'Image mystère';
        popup.appendChild(img);

        // Modal (si tu utilises les ids existants dans ta page)
        const modal = document.getElementById("gtw-image-modal");
        const modalImg = document.getElementById("gtw-modal-img");
        const closeBtn = document.querySelector(".gtw-close-modal");
        const uploadInput = document.getElementById("gtw-upload");

        if (modal && modalImg && closeBtn && uploadInput) {
            img.onclick = function() {
            modal.style.display = "block";
            modalImg.src = this.src;
            };
            closeBtn.onclick = function() {
            modal.style.display = "none";
            };
            modal.onclick = function(e) {
            if (e.target === modal) modal.style.display = "none";
            };
            uploadInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                img.src = evt.target.result;
                modalImg.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
            });
        }

        // Conteneur choix
        const choicesContainer = document.createElement('div');
        choicesContainer.className = 'gtw-choices';
        popup.appendChild(choicesContainer);

        // Feedback
        const feedback = document.createElement('div');
        feedback.className = 'gtw-feedback';
        feedback.setAttribute('role', 'status');        // accessibilité
        feedback.setAttribute('aria-live', 'polite');   // pour lecteurs d'écran
        popup.appendChild(feedback);

        // Helper : affiche un message au-dessus de la popup, annule l'affichage précédent si besoin    */
        /**
         * Affiche le feedback au-dessus de la popup.
         * @param {string} message - Le texte à afficher
         * @param {number} duration - durée en ms avant disparition
         * @param {'success'|'error'|null} type - ajoute une classe de style .success ou .error (optionnel)
         */
        function showFeedbackMessage(message, duration = 1200, type = null) {
            // annuler timer précédent si existant
            if (feedback._timeoutId) {
                clearTimeout(feedback._timeoutId);
                feedback._timeoutId = null;
            }

            // retirer anciennes classes de type
            feedback.classList.remove('success', 'error', 'white');

            // définir le texte
            feedback.textContent = '';

            feedback.textContent = message;

            // appliquer la classe de style si fournie
            if (type === 'success') feedback.classList.add('success');
            if (type === 'error') feedback.classList.add('error');

            // optionnel : texte blanc si tu veux plus de contraste
            // feedback.classList.add('white');

            // montrer
            feedback.classList.add('show');

            // programmer la disparition et nettoyage des classes
            feedback._timeoutId = setTimeout(() => {
                feedback.classList.remove('show');
                // nettoyer les classes de type après la transition (délais 320ms correspond au CSS)
                setTimeout(() => {
                feedback.classList.remove('success', 'error', 'white');
                }, 340);
                feedback._timeoutId = null;
            }, duration);
        }

        // helper simple pour éviter injections si message provient de l'extérieur
        function escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
        }






        // Ecran final (cache par défaut)
        const endScreen = document.createElement('div');
        endScreen.className = 'gtw-endscreen';
        endScreen.style.display = 'none';
        endScreen.innerHTML = `
            <div class="gtw-end-grid">
            <div class="gtw-end-left">
                <div class="gtw-character-wrap">
                <img class="gtw-character" src="" alt="">
                </div>
            </div>

            <div class="gtw-end-right">
                <h3 class="gtw-end-title"></h3>
                <div class="gtw-end-details">
                <p class="gtw-end-scoreline"></p>
                <p class="gtw-end-winstreak"></p>
                </div>
                <div class="gtw-end-actions">
                <button class="gtw-btn gtw-replay">Rejouer</button>
                <button class="gtw-btn gtw-share">Partager</button>
                </div>
            </div>
            </div>
        `;
        popup.appendChild(endScreen);

        // Ajout à la page
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // apparition douce
        setTimeout(() => popup.classList.add('gtw-visible'), 10);

        /* ---------------------------
        Fonctions internes
        --------------------------- */

        function popRandomIndex() {
            const r = gameState.remaining;
            const randomPos = Math.floor(Math.random() * r.length);
            const index = r.splice(randomPos, 1)[0];
            return index;
        }

        function displayQuestion(correctItem, optionItems) {
            img.src = resolveImagePath(correctItem.image);
            img.alt = formatTitle(correctItem.name);

            feedback.classList.remove('show');
            feedback.textContent = '';
            choicesContainer.innerHTML = '';
            gameState.answered = false;

            optionItems.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'gtw-choice';
                btn.textContent = formatTitle(opt.name);
                btn.dataset.value = String(opt.name).toLowerCase();
                btn.disabled = false;

                btn.addEventListener('click', () => {
                    if (gameState.answered) return;
                    gameState.answered = true;

                    const isCorrect = String(opt.name).toLowerCase() === String(correctItem.name).toLowerCase();

                    if (isCorrect) {
                        goodSound.currentTime = 0; // remet au début du son
                        goodSound.play().catch(() => {}); // joue le son
                        showFeedbackMessage('🎉 Bonne réponse !', 1200, 'success');
                    } else {
                        badSound.currentTime = 0; // remet au début du son
                        badSound.play().catch(() => {}); // joue le son
                        showFeedbackMessage('❌ Ce n’est pas ça...', 1400, 'error');
                        // optionnel : vibration courte sur mobile
                        if (navigator.vibrate) navigator.vibrate(80);
                    }



                    if (isCorrect) {
                        gameState.streak++;
                        gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak);
                        gameState.correctCount++;
                        btn.classList.add('correct');
                        // Marquer aussi le bon bouton vert (au cas où c’est pas celui cliqué)
                        choicesContainer.querySelectorAll('.gtw-choice').forEach(b => {
                            if (b.dataset.value === String(correctItem.name).toLowerCase()) {
                                b.classList.add('correct');
                            }
                        });
                    } else {
                        gameState.streak = 0;
                        btn.classList.add('incorrect');
                        // Afficher la bonne réponse immédiatement aussi
                        choicesContainer.querySelectorAll('.gtw-choice').forEach(b => {
                            if (b.dataset.value === String(correctItem.name).toLowerCase()) {
                                b.classList.add('correct');
                            }
                        });
                        // montrer que la question a été répondue (pour atténuer les autres choix)
                        choicesContainer.classList.add('answered');
                        if (navigator.vibrate) navigator.vibrate(100);
                    }

                    // update scoreboard values
                    const infoEl = board.querySelector('.gtw-info');
                    const barEl = board.querySelector('.gtw-progress-bar');
                    const streakSpan = board.querySelector('.gtw-streak span');

                    gameState.current++;
                    infoEl.textContent = `Question ${Math.min(gameState.current, gameState.total)}/${gameState.total}`;
                    barEl.style.width = `${((gameState.current - 1) / gameState.total) * 100}%`;
                    streakSpan.textContent = gameState.streak;

                    // désactiver tous les boutons pour éviter spam
                    choicesContainer.querySelectorAll('.gtw-choice').forEach(b => b.disabled = true);

                    setTimeout(() => {
                        feedback.classList.remove('show');
                        choicesContainer.querySelectorAll('.gtw-choice').forEach(b => {
                            b.classList.remove('correct', 'incorrect');
                            b.disabled = false;
                        });
                        choicesContainer.classList.remove('answered');

                        if (gameState.current > gameState.total) {
                            showEndScreen();
                        } else {
                            loadNextQuestion();
                        }
                        }, 1200);
                });

                choicesContainer.appendChild(btn);
            });
        }

function loadNextQuestion() {
            if (gameState.remaining.length === 0) {
            gameState.remaining = Array.from({ length: gameState.data.length }, (_, i) => i);
            }

            const correctIdx = popRandomIndex();
            const correctItem = gameState.data[correctIdx];

            // Normalise un titre pour comparer les doublons fiablement
            // (même logique que la vérification au clic : minuscules)
            const normalizeTitle = (name) => String(name).trim().toLowerCase();

            // Clé du titre correct : tous les éléments qui portent ce même titre
            // doivent être exclus du pool des leurres (plusieurs images du JSON
            // peuvent partager le même name, ex. "tower-of-god", "tower-of-god-", ...)
            const correctKey = normalizeTitle(correctItem.name);

            const pool = []
                .concat(gameState.data)
                .map((d, i) => ({ d, i }))
                // Exclut l'indice correct ET tout élément portant le même titre normalisé
                .filter(x => x.i !== correctIdx && normalizeTitle(x.d.name) !== correctKey)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(x => x.d);

            const optionItems = [...pool, correctItem].sort(() => 0.5 - Math.random());

            displayQuestion(correctItem, optionItems);
        }

        function showEndScreen() {
            // Masquer UI jeu (garder la difficulty visible si tu le souhaites)
            img.style.display = 'none';
            choicesContainer.style.display = 'none';
            feedback.style.display = 'none';

            // Calcul score précis
            const correctCount = gameState.correctCount;
            const total = gameState.total;
            const percent = Math.round((correctCount / total) * 100);

            const titleEl = popup.querySelector('.gtw-title');
            const endMsg = getEndMessage(correctCount);
            // header affiche maintenant "Partie terminée"
            if (titleEl) titleEl.textContent = 'Partie terminée';
            // écrire le message personnalisé DANS le titre de l'écran final (h3)
            const endTitle = endScreen.querySelector('.gtw-end-title');
            if (endTitle) endTitle.textContent = endMsg;


            // Remplir endScreen (sans percent ni difficulty)
            const scoreLine = endScreen.querySelector('.gtw-end-scoreline');
            const streakLine = endScreen.querySelector('.gtw-end-winstreak');
            scoreLine.innerHTML = `bonnes réponses : <strong>${correctCount}/${total}</strong>`;
            streakLine.innerHTML = `Winstreak max : <strong>${gameState.maxStreak}</strong>`;

            // mettre le petit personnage
            const charImg = endScreen.querySelector('.gtw-character');
            (async () => {
                const imgPath = await selectCharacterImage(correctCount);
                if(imgPath) {
                    charImg.src = resolveImagePath(imgPath);
                }
            })();
            charImg.alt = endMsg;

            // afficher endScreen
            endScreen.style.display = 'block';
            endWinSound.currentTime = 0; // remet au début du son
            endLooseSound.currentTime = 0; // remet au début du son

            // Confettis full page pour bonnes performances (>=6)
            if (correctCount >= 5) {
                endWinSound.play().catch(() => {}); // joue le son
                createConfetti(2000);
            } else {
                endLooseSound.play().catch(() => {}); // joue le son
            }


            // Boutons : remplacer listeners proprement (cloneNode technique déjà en place)
            const replayBtn = endScreen.querySelector('.gtw-replay');
            const shareBtn = endScreen.querySelector('.gtw-share');

            replayBtn.replaceWith(replayBtn.cloneNode(true));
            shareBtn.replaceWith(shareBtn.cloneNode(true));

            const newReplay = endScreen.querySelector('.gtw-replay');
            const newShare = endScreen.querySelector('.gtw-share');

            newReplay.addEventListener('click', () => {
                // reset
                btnJouerSound.currentTime = 0; // remet au début du son
                btnJouerSound.play().catch(() => {}); // joue le son
                gameState.remaining = Array.from({ length: gameState.data.length }, (_, i) => i);
                gameState.current = 1;
                gameState.streak = 0;
                gameState.maxStreak = 0;
                gameState.correctCount = 0;

                // remettre le titre du header (popup) à sa valeur par défaut
                const headerTitle = popup.querySelector('.gtw-title');
                if (headerTitle) headerTitle.textContent = 'Devine le Webtoon';

                // remettre le h3 de l'écran final à son texte par défaut
                const endTitle = endScreen.querySelector('.gtw-end-title');
                if (endTitle) endTitle.textContent = 'Partie terminée';


                // restauration UI et restart
                img.style.display = '';
                choicesContainer.style.display = '';
                feedback.style.display = '';
                endScreen.style.display = 'none';
                board.querySelector('.gtw-info').textContent = `Question 1/${gameState.total}`;
                board.querySelector('.gtw-progress-bar').style.width = '0%';
                board.querySelector('.gtw-streak span').textContent = '0';
                loadNextQuestion();
            });

            newShare.addEventListener('click', async () => {
                shareSound.currentTime = 0; // remet au début du son
                shareSound.play().catch(() => {}); // joue le son
                const popup = document.querySelector('.gtw-popup-game'); // ou .gtw-overlay-game selon le cas

                // 1. Charger html2canvas (si pas déjà inclus)
                if (typeof html2canvas === 'undefined') {
                    await loadHtml2Canvas();
                }

                // 2. Capturer en image
                html2canvas(popup).then(canvas => {
                    canvas.toBlob(async blob => {
                        const file = new File([blob], "resultat-webtoon.png", { type: "image/png" });

                        const shareText = `J'ai joué à Devine le Webtoon — ${correctCount}/${total} (${percent}%). Winstreak max: ${gameState.maxStreak}.`;

                        // 3. Si le navigateur et l’appareil supportent le partage natif avec fichiers
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            navigator.share({
                                title: 'Devine le Webtoon',
                                text: shareText,
                                files: [file]
                            }).catch(() => {});
                        } else {
                            // Fallback → téléchargement direct
                            const url = URL.createObjectURL(file);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = "resultat-webtoon.png";
                            a.click();
                            URL.revokeObjectURL(url);
                            alert("Image téléchargée (partage direct non supporté sur ton navigateur)");
                        }
                    });
                });
            });

            // Petit helper pour charger html2canvas dynamiquement
            function loadHtml2Canvas() {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                        // Lib js qui pgotographie un élément html et le convertit en canvas
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }


        }


        // Lance la première question
        loadNextQuestion();
    } // end startGuessTheWebtoonGame


});




/*
prochaines étapes :

- Modifier pour éviter qu'on retrouve 2 fois le même titre de webtoon dans les propositions.
- Faire une IA pour les sites de lectures français : L'une va cherché si d'abord le chapitre existe sur Phenixscans,
    Sinon sur ScanManga en libre accès, Sinon sur CrunchyScans, Sinon écrire "pas trouvé". (Ou alors si c'est possible regardé les crédits des chaps récents pour savoir quelle team s'en occupe)
     Pour la version officielle, chercher d'abord sur Webtoon, puis sur Ono, puis sur Delitoon, (puis d'autres
    versions officielles), Sinon écrire "pas trouvé".
     Pour les novels : (on verra)
     Pour tout type d'infos : Nautiljon
    avec scrapper nautiljon : https://github.com/barthofu/nautiljon-scraper ou même API non-officielle https://github.com/iambluedev1/nautiljon-api
- Vol affichage nb de chapitres en fr et en engl : 🇫🇷 70  US 180. Via les serveurs discord et les sites de redistribution (scan-manga et manga-scantrad.io)
- Faire un script qui convertit automatiquement mes fichiers en webp, à part s'ils sont déjà en avif ou en gif
- Chercher comment optimiser l'apparition d'une page web, pour qu'elle soit plus rapide. Notamment les images
- Poster sur un vrai site
- Rajouter un système où le rang du joueur, s'il n'est pas dans le top 10 qui est affiché, est affiché en bas du classement quand même.
    Site -> console -> lighthouse | GT metrix (les 2 pour tester la vitesse de mon site. Sinon s'il met plus de 3s à charger -> trop lent)
- Faire le formulaire Google Sheets pour rentrer les nouveaux webtoons sur le site (avec Blackbox AI directement intégré à VSCode)

    (Intéressant pour mon site) :
Firebase AI Logic : Construire des fonctionnalités d'IA intelligentes :
- Génération de contenu : Votre application pourrait générer automatiquement des descriptions de produits, des légendes pour des photos, des résumés d'articles, ou même des histoires créatives.
- Chatbots et assistants virtuels : Créez des interfaces de conversation intelligentes qui peuvent interagir avec les utilisateurs, répondre à des questions ou les guider.
- Traitement du langage naturel (TLN) : Analysez et comprenez le texte des utilisateurs pour des expériences plus personnalisées, comme résumer des notes ou traduire du contenu.
- Expériences créatives : Imaginez des jeux où l'IA génère des quêtes ou des dialogues uniques, ou des outils qui aident les utilisateurs à brainstormer des idées.

- API pour intégrer un chatbot : https://aistudio.google.com/welcome
    chatbot, bouton de traduction pour des utilisateurs étrangers, génération de descriptions à partir d'un titre,
    recommander des webtoons en fonction des goûts de l'utilisateur...
- Créer une messagerie sécurisée


OPTIMISATION SITE IMAGE :
- Convertir tes images en WebP/AVIF toi-même (avec ton script ou Squoosh).
- Mettre ton domaine derrière Cloudflare gratuit pour profiter du CDN/cache.


AUTRE :
- faire une catégorie "eyes", "finances" et "personnage flouté ou couverture floutée", "guess the character's name", Le BAC de Webtoons" ou "Webtoons type BAC" ou alors "BAC +5"
- catégorie où il faut deviner la date de parution de la version d'origine


MOTS DE VOCABULAIRE :
Images :
- Fluide, raffinée, élégante, sobre, épurée, claire, douce (smooth)

PROJETS FUTURS :
- Projet de site qui convertit et compresse des images


Dragon :
dragon-devouring mage ; swordmaster's youngest son (Murakan) ; 


"Swordmaster's Youngest Son" ; "Talent Swallowing Magician" "Superhuman Battlefield" ; "Auto-Hunting with my Clones" ; "Bastard Son Was the Emperor" ; "Children of the Rune"

System : Archmage Streamer ; 

School Life :
Mercenary Enrollment ; To Not Die ; Lookism ; Reality Quest ; Questism ; Webtoon-character-na-kang-lim ; the-challenger ; Viral Hit


Pets / Animals :
Reincarnation of the Warrior Party Archmage ; dragon-devouring-mage ; taming-master ; archmage-streamer ; Eleceed ; The Genius Tamer of the Academy


Reincarnation :
reincarnation-path-of-the-underworld-king






Tu as bien remplie les informations sans retirer de catégories, mais pour bad born blood et academy's undercover professor tu as retiré les liens des images. Ce n'est pas bon
On va tout reprendre depuis le début, respècte bien ma consigne. Tu es libre de me poser des questions si ce n'est pas assez clair.


Je t'envoie mon json (nommé all.json). Tout d'abord lis-le entièrement et intensément.
Une fois cela fait, recherche les infos en **français** de chaque webtoon, en priorité sur Nautiljon. Si tu ne trouves pas le webtoon sur nautiljon avec le titre principal, c'est possible qu'il soit reférencé sous un autre nom. Utilise les "aliases" présent dans le json.

Les infos à rechercher et à remplir sont :
- Le type (si c'est un manhwa, un manhua ou un manga)
- Le genre (ça va être les thèmes comme par exemple action, romance, réincarnation, arts martiaux et encore d'aytres...)
- Le statut (status) (si le webtoon est en cours, en pause, complété, abandonné ou autre...)
- Le synopsis (résumé en gros)
- Les adaptations (en livres, anime et autres...)
attention, ce n'est pas parce que tu ne dois retranscrire que ces infos que tu dois supprimer les catégories non-remplies, comme par exemples sites ou previewImages. Tu dois même laisser tel quel les catégories vides. 


Voici un exemple de structure d'un webtoon sur mon json :

{
          "id": "damn-reincarnation",
          "title": "Damn Reincarnation",
          "aliases": [
            "Fichue Réincarnation",
            "My Blasted Reincarnated Life"
          ],
          "image": "IMAGES/2-EXCELLENTS/damn reincarnation/cover.webp",
          "alt": "Image : Damn Reincarnation",
          "details": {
            "title": "Damn Reincarnation",
            "banner": "IMAGES/2-EXCELLENTS/damn reincarnation/bannière.webp",
            "cover": "IMAGES/2-EXCELLENTS/damn reincarnation/cover.webp",
            "alt": "Image de Damn Reincarnation",
            "type": "Manhwa",
            "genre": [
              "Action",
              "Réincarnation"
            ],
            "status": "Abandonné (mais future reprise à 0 par un autre studio)",
            "chapters": "81 - 25 Août 2024",
            "sites": [
              {
                "name": "Phenixscans",
                "url": "https://www.phenix-scans.com/manga/damn-reincarnation",
                "note": "team de Scantrad"
              },
              {
                "name": "Piccoma (anciennement)",
                "url": "",
                "note": "version officielle (ancienne)"
              },
              {
                "name": "Roman en ligne",
                "url": "https://world-novel.fr/oeuvres/damn-reincarnation",
                "note": ""
              }
            ],
            "synopsis": "Hamel, un guerrier qui partit en voyage avec ses camarades pour anéantir le roi démon, mourut juste avant de pouvoir le rencontrer. Il se réincarna alors en tant que descendant de son compagnon héros, Vermouth.\nHamel, se prénommant maintenant Eugène Lionhart, a hérité du sang du grand Vermouth. Grâce à ses connaissances antérieures, il façonne un corps à l’image de la puissance qu’il aura besoin pour essayer de comprendre ce qui a pu arriver après sa mort. Et surtout comprendre pourquoi les humains et les mages coexistent avec les démons.\nFace à tant d’interrogations, il emprunte le corps d’Eugène et commence à parcourir le voyage inachevé de sa vie antérieure.",
            "previewImages": [
              "IMAGES/2-EXCELLENTS/damn reincarnation/img1.webp",
              "IMAGES/2-EXCELLENTS/damn reincarnation/img2.avif",
              "IMAGES/2-EXCELLENTS/damn reincarnation/img3.webp",
              "IMAGES/2-EXCELLENTS/damn reincarnation/img4.webp",
              "IMAGES/2-EXCELLENTS/damn reincarnation/img5.avif",
              "IMAGES/2-EXCELLENTS/damn reincarnation/img6.webp",
              "IMAGES/2-EXCELLENTS/damn reincarnation/img7.avif",
              "IMAGES/2-EXCELLENTS/damn reincarnation/img8.jpg"
            ],
            "adaptations": [
              "format papier"
            ]
          }



Complète tous les webtoons des catégories Très Bons jusqu'à Ennuyants.
Rempli seulement les champs listés précédemment.
La manière dont les genres seront listés ressembleront à ça, par exemple pour "action" ce sera "Action", pour les mots séparés par des tirets comme par exemple "arts-martiaux" ce sera "Arts-Martiaux"

Pour ce faire tu devras utiliser ton outil de recherche approfondie, et avant de commencer, envoie-moi un exemple de ce que tu à compris de ce que tu dois faire pour que je puisse vérifier que c'est bien ce que je souhaite.







*/