
function startGuessTheWebtoon() {
    const gameContainer = document.getElementById('memory-game');
    gameContainer.classList.add('hidden');
    gameContainer.classList.remove('fade-in');
    document.getElementById('memory-difficulty-selector').classList.add('hidden');
    document.getElementById('memory-stats').classList.add('hidden');
    document.getElementById('leaderboard-section').classList.add('hidden');
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
                <div class="gtw-example-images">
                    <img src="../RESSOURCES/img-guessthewebtoon/exemple_flou.png" class="gtw-example-image" alt="Exemple flou" />
                    <img src="../RESSOURCES/img-guessthewebtoon/READY.png" class="gtw-ready-image" alt="Prêt" />
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

    /* ---------------------------
    Choisit l'image du petit personnage selon le score
    (adapte les chemins si nécessaire)
    --------------------------- */
    function selectCharacterImage(score) {
    if (score === 10) return resolveImagePath('RESSOURCES/img-guessthewebtoon/characters/char-10.png');
    if (score >= 6 && score <= 9) return resolveImagePath('RESSOURCES/img-guessthewebtoon/characters/char-9-6.png');
    if (score === 5) return resolveImagePath('RESSOURCES/img-guessthewebtoon/characters/char-5.png');
    if (score >= 1 && score <= 4) return resolveImagePath('RESSOURCES/img-guessthewebtoon/characters/char-4-1.png');
    return resolveImagePath('RESSOURCES/img-guessthewebtoon/characters/char-0.png');
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



    /* ---------------------------
    Fonction principale : démarre / instancie le jeu
    --------------------------- */
    async function startGuessTheWebtoonGame(difficulty = 'facile') {
    const diffKey = String(difficulty).toLowerCase();
    const filePath = `../RESSOURCES/json-guessthewebtoon/cover-${diffKey}.json`;

    if (document.querySelector('.gtw-overlay-game')) {
        console.warn('Le jeu est déjà en cours.');
        return;
    }

    // Chargement JSON
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

    // État du jeu
    const gameState = {
        difficulty: diffKey,
        data: data,
        remaining: Array.from({ length: data.length }, (_, i) => i),
        total: Math.min(10, data.length),
        current: 1,
        streak: 0,
        maxStreak: 0,
        correctCount: 0,
        answered: false
    };

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
    popup.appendChild(feedback);

    // Ecran final (cache par défaut)
    const endScreen = document.createElement('div');
    endScreen.className = 'gtw-endscreen';
    endScreen.style.display = 'none';
    endScreen.innerHTML = `
        <div class="gtw-end-grid">
        <div class="gtw-end-left">
            <div class="gtw-character-wrap">
            <img class="gtw-character" src="" alt="Personnage rigolo">
            </div>
        </div>

        <div class="gtw-end-right">
            <h3 class="gtw-end-title">Partie terminée</h3>
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
        btn.disabled = false;

        btn.addEventListener('click', () => {
            if (gameState.answered) return;
            gameState.answered = true;

            const isCorrect = String(opt.name).toLowerCase() === String(correctItem.name).toLowerCase();

            feedback.textContent = isCorrect ? '🎉 Bonne réponse !' : '❌ Ce n’est pas ça...';
            feedback.classList.add('show');

            if (isCorrect) {
            gameState.streak++;
            gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak);
            gameState.correctCount++;
            btn.classList.add('correct');
            } else {
            gameState.streak = 0;
            btn.classList.add('incorrect');
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

        const pool = gameState.data
        .map((d, i) => ({ d, i }))
        .filter(x => x.i !== correctIdx)
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

        // Titre header (on y met le message personnalisé de fin)
        const titleEl = popup.querySelector('.gtw-title');
        const endMsg = getEndMessage(correctCount);
        titleEl.textContent = endMsg; // <-- voilà le changement demandé

        // Remplir endScreen (sans percent ni difficulty)
        const scoreLine = endScreen.querySelector('.gtw-end-scoreline');
        const streakLine = endScreen.querySelector('.gtw-end-winstreak');
        scoreLine.innerHTML = `<strong>${correctCount}/${total}</strong> bonnes réponses`;
        streakLine.innerHTML = `Winstreak max : <strong>${gameState.maxStreak}</strong>`;

        // mettre le petit personnage
        const charImg = endScreen.querySelector('.gtw-character');
        charImg.src = selectCharacterImage(correctCount);
        charImg.alt = endMsg;

        // afficher endScreen
        endScreen.style.display = 'block';

        // Confettis full page pour bonnes performances (>=6)
        if (correctCount >= 6) {
            createConfetti(2000);
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
            gameState.remaining = Array.from({ length: gameState.data.length }, (_, i) => i);
            gameState.current = 1;
            gameState.streak = 0;
            gameState.maxStreak = 0;
            gameState.correctCount = 0;

            // remettre titre par défaut
            const titleDefault = popup.querySelector('.gtw-title');
            titleDefault.textContent = 'Devine le Webtoon';

            // restaurer UI
            img.style.display = '';
            choicesContainer.style.display = '';
            feedback.style.display = '';
            endScreen.style.display = 'none';
            board.querySelector('.gtw-info').textContent = `Question 1/${gameState.total}`;
            board.querySelector('.gtw-progress-bar').style.width = '0%';
            board.querySelector('.gtw-streak span').textContent = '0';
            loadNextQuestion();
        });

        newShare.addEventListener('click', () => {
            const shareText = `J'ai joué à Devine le Webtoon — ${correctCount}/${total} (${percent}%). Winstreak max: ${gameState.maxStreak}.`;
            if (navigator.share) {
            navigator.share({ title: 'Devine le Webtoon', text: shareText }).catch(() => {});
            } else {
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
- Faire mise en page du bloc de fin de jeu :
    - Remplacer le titre "Devine le Webtoon" qui est généré en javascript par le message personnalisé de fin de jeu :
        - 10/10 → Le trône des Webtoons est à toi 👑
        - 9/10 à 6/10 → Félicitations ! Tu es un maître des Webtoons 🔥
        - 5/10 → Pas mal… mais t’es pas encore le personnage principal !
        - 4/10 à 1/10 → Tes réponses étaient… créatives 😏
        - 0/10 → Tu viens de débloquer l’achievement : 'Je n’ai rien compris' 🏆
    - Pas besoin de toucher à la croix de fermeture et à la barre de progression (gtw-scoreboard)
    - Placer le nombre de winstreak maximal. (déjà mis en place, pas besoin d'y toucher)
    - Afficher un score en pourcentage en fonction du nombre de bonnes réponses sur 10 qu'il a eu.
    - Styliser les boutons "Rejouer" et "Partager dans le même style"
    - Mascotte    
    - Animation courte et smooth de confettis
    - Animations subtiles, ombrages doux
    L’ensemble doit rester cohérent avec la pop-up initiale, mais s’adapter à ce nouveau contexte interactif de quiz. Les transitions doivent être douces, élégantes, premium. Le design noble et raffiné. Le tout responsive

- Lui demander s'il y a des incohérences dans mon css, et de fixer ce problème d'incohérence si nécessaire
- Faire en sorte que l'image à deviner soit bloqué à un certain nombre de pixels, qu'elle ne peut pas dépasser.
- Mettre une image pour "partager" qui reprend exactement l'image de fin de jeu
- Modifier mes messages quand j'ai trouvé ou non le bon titre, pour qu'il s'affiche centré au milieu de ma pop-up, avec une animation d'entrée et de sortie type "machine à écrire" (et qui aura donc aussi une animation de sortie type machine à écrire)
- Webtoon The Boxer enlever le titre au milieu de l'image
- Animation sobre et douce rouge sur la case où le joueur s'est trompée, et verte sur la case où la case de la bonne réponse. Ne pas oublier de mettre aussi une animation douce et sobre verte sur la case de la bonne réponse, quand l'utilisateur s'est trompée de case.
- Trouver une icône pour ma partie "mini-jeux" de mon site de webtoon
- Son : quand le joueur clique sur une catégorie, et quand il clique sur "JOUER"
- Régler problème de clé API visible.
- Vol affichage nb de chapitres en fr et en engl : 🇫🇷 70  🇬🇧 180

Autour du plateau de jeu :
- Motifs autour du plateau (bulles, effets de papier, cadres illustrés)


AUTRE :
- faire une catégorie "eyes" et "personnage flouté ou couverture floutée"


MOTS DE VOCABULAIRE :
Images :
- Fluide, raffinée, élégante, sobre, épurée, claire, douce (smooth)

*/