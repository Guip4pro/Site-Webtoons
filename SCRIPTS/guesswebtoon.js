

function startGuessTheWebtoon() {
    const gameContainer = document.getElementById('memory-game');
    gameContainer.classList.add('hidden');
    gameContainer.classList.remove('fade-in');
    document.getElementById('memory-difficulty-selector').classList.add('hidden');
    document.getElementById('memory-stats').classList.add('hidden');
    document.getElementById('leaderboard-section').classList.add('hidden');
    // document.getElementById('accordion-container').toggle('hidden');

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

window.startGuessTheWebtoon = startGuessTheWebtoon;


// Accordéons principaux
const accordions = document.querySelectorAll('.accordion');
accordions.forEach((acc) => {
    // Ajout de la flèche initiale
    acc.textContent = `▸ ${acc.textContent.trim()}`;

    acc.addEventListener('click', () => {
        acc.classList.toggle('active');
        const panel = acc.nextElementSibling;
        const isOpen = panel.style.display === 'flex';

        panel.style.display = isOpen ? 'none' : 'flex';
        acc.textContent = isOpen ? `▸ ${acc.textContent.slice(2).trim()}` : `▾ ${acc.textContent.slice(2).trim()}`;
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


// Commencer le jeu
document.addEventListener('DOMContentLoaded', () => {
    console.log("Script chargé ✅");

    // Initialise la pop-up (et sa fonction globale)
    initGuessTheWebtoonPopup();

    document.querySelectorAll('.scroll-item').forEach(item => {
        item.addEventListener('click', () => {
            console.log("Tu as cliqué sur :", item.textContent.trim());

            // Appelle ici ta fonction perso
            handleScrollItemClick(item);
        });
    });

    function handleScrollItemClick(el) {
        const difficulty = el.textContent.trim(); // On suppose que le texte contient la difficulté
        console.log("Lancement du jeu avec difficulté :", difficulty);
        showGuessTheWebtoonPopup(difficulty); // Appelle la fonction globale créée
    }




    function initGuessTheWebtoonPopup() {
        const popupSound = new Audio('popup-sound.mp3');

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
                <img src="images/exemple_flou.png" alt="Exemple flou" />
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

            // Son
            popupSound.play().catch(() => {});

            // Animation d’apparition
            setTimeout(() => popup.classList.add('gtw-visible'), 10);

            // Fermeture
            overlay.querySelector('.gtw-close').addEventListener('click', () => {
                overlay.remove();
            });

            // Démarrage du jeu
            playButton.addEventListener('click', () => {
                overlay.remove();
                startGuessTheWebtoonGame(difficulty);     // Fonction lançant le vrai jeu
            });
        };
    }



    // Fonction pour formater les titres
    function formatTitle(str) {
    if (!str) return '';
    return str
        .replace(/-/g, ' ') // Remplacement les tirets par des espaces
        .replace(/\b\w/g, l => l.toUpperCase());    // Met première lettre de chaque mot en majuscule
    }


    /* ---------------------------
    UTILITAIRE : résout le chemin d'image
    - Si le chemin commence par http ou / : on l'utilise tel quel
    - Sinon on le transforme en chemin à partir de la racine : "/RESSOURCES/..."
    (tu peux adapter selon ta structure serveur si besoin)
    --------------------------- */
    function resolveImagePath(imgPath) {
    if (!imgPath) return '';
    imgPath = String(imgPath).replace(/^\/+/, ''); // retire slash de début
    if (imgPath.startsWith('http')) return imgPath;
    return '../' + imgPath; // chemin absolu à partir de la racine du site
    }

    /* ---------------------------
    Fonction principale : démarre / instancie le jeu
    - charge le JSON (une fois)
    - crée l'UI (une seule fois)
    - gère l'enchaînement des questions
    --------------------------- */
    async function startGuessTheWebtoonGame(difficulty = 'facile') {
    // Normalise difficulty & chemin vers le json
    const diffKey = String(difficulty).toLowerCase();
    const filePath = `../RESSOURCES/json-guessthewebtoon/cover-${diffKey}.json`;

    // Si pop-up déjà ouverte, on ne recrée pas (tu peux forcer un restart en fermant d'abord)
    if (document.querySelector('.gtw-overlay-game')) {
        console.warn('Le jeu est déjà en cours.');
        return;
    }

    // Chargement JSON (une seule fois)
    let data;
    try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status} - ${res.statusText}`);
        data = await res.json();
    } catch (err) {
        console.error('Erreur de chargement du JSON :', err);
        alert("Impossible de charger les questions pour cette catégorie. Vérifie le chemin du JSON.");
        return;
    }

    if (!Array.isArray(data) || data.length < 1) {
        console.error('JSON vide ou mal formé');
        alert('Pas de données disponibles pour cette catégorie.');
        return;
    }

    /* ---------------------------
        ÉTAT DU JEU (persistant pendant la pop-up)
        - data: tableau chargé
        - remaining: indices encore non utilisés (pour éviter doublons)
        - total: nombre de questions dans la partie (max 10 ou moins si pas assez d'items)
        - current: index de progression (1-based)
        - streak & maxStreak
        --------------------------- */
    const gameState = {
        difficulty: diffKey,
        data: data, // tableau d'objets { name, image, ... }
        remaining: Array.from({ length: data.length }, (_, i) => i),
        total: Math.min(10, data.length),
        current: 1,
        streak: 0,
        maxStreak: 0,
        answered: false // flag local par question
    };

    /* ---------------------------
        Création de l'UI de la pop-up (une seule fois)
        --------------------------- */
    const overlay = document.createElement('div');
    overlay.className = 'gtw-overlay-game';

    const popup = document.createElement('div');
    popup.className = 'gtw-popup-game';

    // Header
    const header = document.createElement('div');
    header.className = 'gtw-header';
    header.innerHTML = `
        <h2>Devine le Webtoon</h2>
        <span class="gtw-close" title="Fermer">&times;</span>
    `;
    popup.appendChild(header);

    // Fermeture
    header.querySelector('.gtw-close').addEventListener('click', () => {
        document.body.removeChild(overlay);
        // Nettoyage (si besoin)
    });

    // Difficulty display
    const diffBox = document.createElement('div');
    diffBox.className = `gtw-difficulty gtw-${gameState.difficulty}`;
    diffBox.textContent = `Difficulté : ${formatTitle(gameState.difficulty)}`;
    popup.appendChild(diffBox);

    // Scoreboard
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

    // IMAGE CLIQUABLE
    const modal = document.getElementById("gtw-image-modal");
    const modalImg = document.getElementById("gtw-modal-img");
    const closeBtn = document.querySelector(".gtw-close-modal");
    const uploadInput = document.getElementById("gtw-upload");

    // Ouvrir le modal
    img.onclick = function() {
        modal.style.display = "block";
        modalImg.src = this.src;
    };

    // Fermer le modal
    closeBtn.onclick = function() {
        modal.style.display = "none";
    };

    // Fermer si on clique en dehors de l'image
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    };

    // Changer l'image avec upload
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



    // Conteneur choix
    const choicesContainer = document.createElement('div');
    choicesContainer.className = 'gtw-choices';
    popup.appendChild(choicesContainer);

    // Feedback
    const feedback = document.createElement('div');
    feedback.className = 'gtw-feedback';
    popup.appendChild(feedback);

    // Ecran final (cache par défaut)
    const endScreen = document.createElement('div');
    endScreen.className = 'gtw-endscreen';
    endScreen.style.display = 'none';
    endScreen.innerHTML = `
        <h3>Partie terminée</h3>
        <div class="gtw-results"></div>
        <div style="margin-top:12px;">
        <button class="gtw-replay">Rejouer</button>
        <button class="gtw-share">Partager</button>
        </div>
    `;
    popup.appendChild(endScreen);

    // Ajout à la page
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Animation d'apparition (si css attend .gtw-visible)
    setTimeout(() => popup.classList.add('gtw-visible'), 10);

    /* ---------------------------
        Fonctions internes : choisir et afficher une question
        --------------------------- */

    // Sélectionne aléatoirement un index dans gameState.remaining et le retire (évite doublons)
    function popRandomIndex() {
        const r = gameState.remaining;
        const randomPos = Math.floor(Math.random() * r.length);
        const index = r.splice(randomPos, 1)[0];
        return index;
    }

    // Affiche une question à partir de l'item correct et des options
    function displayQuestion(correctItem, optionItems) {
        // Image
        img.src = resolveImagePath(correctItem.image);
        img.alt = formatTitle(correctItem.name);

        // Reset feedback, options
        feedback.classList.remove('show');
        feedback.textContent = '';
        choicesContainer.innerHTML = '';
        gameState.answered = false;

        // Créer boutons options
        optionItems.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'gtw-choice';
        btn.textContent = formatTitle(opt.name);
        btn.disabled = false;

        btn.addEventListener('click', () => {
            if (gameState.answered) return;
            gameState.answered = true;

            const isCorrect = String(opt.name).toLowerCase() === String(correctItem.name).toLowerCase();

            // Visuel / feedback
            feedback.textContent = isCorrect ? '🎉 Bonne réponse !' : '❌ Ce n’est pas ça...';
            feedback.classList.add('show');

            // update streaks
            if (isCorrect) {
            gameState.streak++;
            gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak);
            btn.classList.add('correct');
            } else {
            gameState.streak = 0;
            btn.classList.add('incorrect');
            // petite vibration si dispo
            if (navigator.vibrate) navigator.vibrate(100);
            }

            // update scoreboard values
            const infoEl = board.querySelector('.gtw-info');
            const barEl = board.querySelector('.gtw-progress-bar');
            const streakSpan = board.querySelector('.gtw-streak span');

            // on incrémente current (on affiche la prochaine question index)
            gameState.current++;
            infoEl.textContent = `Question ${Math.min(gameState.current, gameState.total)}/${gameState.total}`;
            barEl.style.width = `${((gameState.current - 1) / gameState.total) * 100}%`;
            streakSpan.textContent = gameState.streak;

            // désactiver tous les boutons pour éviter spam
            choicesContainer.querySelectorAll('.gtw-choice').forEach(b => b.disabled = true);

            // Après délai, soit prochaine question, soit écran final
            setTimeout(() => {
            feedback.classList.remove('show');
            // nettoyer classes
            choicesContainer.querySelectorAll('.gtw-choice').forEach(b => {
                b.classList.remove('correct', 'incorrect');
                b.disabled = false;
            });

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

    // Charge la prochaine question : choisit correct + 3 mauvaises réponses aléatoires
    function loadNextQuestion() {
        if (gameState.remaining.length === 0) {
        // Si on a épuisé tout le data (mais current <= total), on peut re-remplir remaining
        gameState.remaining = Array.from({ length: gameState.data.length }, (_, i) => i);
        }

        // 1) choisir correct
        const correctIdx = popRandomIndex();
        const correctItem = gameState.data[correctIdx];

        // 2) choisir 3 mauvaises réponses dans le reste des indices (ou parmi tout si peu d'items)
        // Construire un pool temporaire (indices restants + si nécessaire, repiquer dans tout)
        const pool = gameState.data
        .map((d, i) => ({ d, i }))
        .filter(x => x.i !== correctIdx)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(x => x.d);

        // 3) mélanger et afficher (mélange correct+pool)
        const optionItems = [...pool, correctItem].sort(() => 0.5 - Math.random());

        // afficher
        displayQuestion(correctItem, optionItems);
    }

    // Affiche l'écran final
    function showEndScreen() {
        // Masquer éléments de jeu
        img.style.display = 'none';
        choicesContainer.style.display = 'none';
        feedback.style.display = 'none';
        diffBox.style.display = 'none';

        // Remplir résultat
        const results = endScreen.querySelector('.gtw-results');
        const correctCount = Math.max(0, gameState.total - (gameState.current - 1) + (gameState.streak ? 0 : 0)); 
        // Note : on n'a pas compté explicitement les bonnes réponses séparément, on peut suivre un compteur si tu veux.
        // Je propose d'ajouter un champ correctCount qui s'incrémente sur bonne réponse pour être précis.
        // Pour l'instant, on calcule approximativement (meilleur est d'ajouter correctCount dans gameState).

        // Je vais plutôt afficher un bilan plus utile (total, maxStreak)
        results.innerHTML = `
        <p>Tu as répondu à <strong>${gameState.total}</strong> questions.</p>
        <p>Winstreak maximal : <strong>${gameState.maxStreak}</strong></p>
        <p>Merci d'avoir joué !</p>
        `;

        endScreen.style.display = 'block';

        // Boutons
        endScreen.querySelector('.gtw-replay').addEventListener('click', () => {
        // réinitialiser le jeu : recréer remaining + reset counters + masquer endScreen + afficher UI
        gameState.remaining = Array.from({ length: gameState.data.length }, (_, i) => i);
        gameState.current = 1;
        gameState.streak = 0;
        gameState.maxStreak = 0;
        img.style.display = '';
        choicesContainer.style.display = '';
        feedback.style.display = '';
        diffBox.style.display = '';
        endScreen.style.display = 'none';
        board.querySelector('.gtw-info').textContent = `Question 1/${gameState.total}`;
        board.querySelector('.gtw-progress-bar').style.width = '0%';
        board.querySelector('.gtw-streak span').textContent = '0';
        loadNextQuestion();
        });

        endScreen.querySelector('.gtw-share').addEventListener('click', () => {
        // exemple simple : partager via navigator.share si dispo
        const shareText = `J'ai joué à Devine le Webtoon ! J'ai fait un max streak de ${gameState.maxStreak}.`;
        if (navigator.share) {
            navigator.share({ title: 'Devine le Webtoon', text: shareText }).catch(() => {});
        } else {
            // fallback : copier dans le presse-papiers
            navigator.clipboard?.writeText(shareText);
            alert('Score copié dans le presse-papiers (fallback).');
        }
        });
    }

    // Lance la première question
    loadNextQuestion();
    } // end startGuessTheWebtoonGame

});





/*
prochaines étapes :
- Augmenter la taille de l'image sur les petits écrans
- Mettre une image pour "partager"
- Modif images "The Boxer", "The Greatest Estate Developper", "Sweet Home" crop bas
- Modifier mes messages quand j'ai trouvé ou non le bon titre, pour qu'il s'affiche centré au milieu de ma pop-up, avec une animation d'entrée et de sortie type "machine à écrire" (et qui aura donc aussi une animation de sortie type machine à écrire)
- Trouver une icône pour mon site Guillaume Marolleau "Tous mes projets" ainsi qu'une deuxième pour ma partie "mini-jeux" de mon site de webtoon
- Son : quand le joueur clique sur une catégorie, et quand il clique sur "JOUER"
- Régler,problème de clé API visible.


Faire un toggle pour l'apparition de l'entièreté du jeu "Guess The Webtoon"

Autour du plateau de jeu :
- Prendre une mascotte (préférence barbare Bjorn fils de Yandel), et déterminer en image à l'aide de l'IA ses différentes expressions
- Motifs autour du plateau (bulles, effets de papier, cadres illustrés)


- Prendre le json correspondant à la catégorie, et pour les autres réponses "fausses". Pour la réponse "bonne", il faudra utiliser le chemin du nom du fichier, qui comprend directement le nom du webtoon.
- Ma méthode est-elle bonne, ou y a t il une méthode plus simple et efficace ?

AUTRE :
- faire une catégorie "eyes" et "personnage flouté ou couverture floutée"
*/