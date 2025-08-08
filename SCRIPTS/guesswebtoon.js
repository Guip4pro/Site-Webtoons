

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



    // Fonction utilitaire pour formater les titres
    function formatTitle(str) {
        return str
            .replace(/-/g, ' ')                 // Remplace tirets par espaces
            .replace(/\b\w/g, l => l.toUpperCase()); // Met première lettre de chaque mot en majuscule
    }

    async function startGuessTheWebtoonGame(difficulty) {
        try {
            // Charger le JSON correspondant à la difficulté
            const filePath = `../RESSOURCES/json-guessthewebtoon/cover-${difficulty.toLowerCase()}.json`;
            const response = await fetch(filePath);
            if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status} - ${response.statusText}. En gros mon fichier est introuvable, sûrement à cause d'un mauvais lien`);
            }
            const data = await response.json();


            if (data.length < 4) {
                console.error("Pas assez de données pour cette catégorie");
                return;
            }

            // Sélection aléatoire de la bonne réponse
            const correctIndex = Math.floor(Math.random() * data.length);
            const correctItem = data[correctIndex];

            // Sélection aléatoire des mauvaises réponses
            const wrongItems = data
                .filter((_, i) => i !== correctIndex)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            // Mélanger toutes les réponses
            const allOptions = [...wrongItems, correctItem].sort(() => 0.5 - Math.random());

            // Si la pop-up est déjà ouverte, on ne la recrée pas
            if (document.querySelector('.gtw-overlay-game')) return;

            // === Données de jeu ===
            const gameData = {
                difficulty: difficulty,
                current: 1,
                total: 10,
                streak: 0,
                correctName: correctItem.name
            };

            // === 1) Overlay ===
            const overlay = document.createElement('div');
            overlay.className = 'gtw-overlay-game';
            document.body.appendChild(overlay);

            // === 2) Pop-up ===
            const popup = document.createElement('div');
            popup.className = 'gtw-popup-game';
            overlay.appendChild(popup);

            // === 3) Header ===
            const header = document.createElement('div');
            header.className = 'gtw-header';
            header.innerHTML = `
                <h2>Devine le Webtoon</h2>
                <span class="gtw-close">&times;</span>
            `;
            popup.appendChild(header);
            header.querySelector('.gtw-close')
                .addEventListener('click', () => document.body.removeChild(overlay));

            // === 4) Difficulté ===
            const diff = document.createElement('div');
            diff.className = `gtw-difficulty gtw-${gameData.difficulty.toLowerCase()}`;
            diff.textContent = `Difficulté : ${gameData.difficulty}`;
            popup.appendChild(diff);

            // === 5) Scoreboard ===
            const board = document.createElement('div');
            board.className = 'gtw-scoreboard';
            board.innerHTML = `
                <div class="gtw-progress">
                    <div class="gtw-progress-bar" style="width:0%"></div>
                </div>
                <div class="gtw-info">Question ${gameData.current}/${gameData.total}</div>
                <div class="gtw-streak">🔥 Streak : <span>${gameData.streak}</span></div>
            `;
            popup.appendChild(board);

            // === 6) Image mystère ===
            // Déterminer le chemin en fonction du JSON utilisé
            const jsonFileName = filePath.split('/').pop().replace('.json', '');
            const selectedCategoryPath = jsonFileName.replace('-', '/').toLowerCase();
            const img = document.createElement('img');
            img.className = 'gtw-question-image';
            // Si ton JSON a juste un nom de fichier → adapte ici le chemin
            img.src = '/' + correctItem.image.replace(/^\/+/, '');
            img.alt = formatTitle(correctItem.name);
            popup.appendChild(img);

            // === 7) Choix QCM ===
            const choicesContainer = document.createElement('div');
            choicesContainer.className = 'gtw-choices';
            popup.appendChild(choicesContainer);

            const feedback = document.createElement('div');
            feedback.className = 'gtw-feedback';
            popup.appendChild(feedback);

            let answered = false; // pour bloquer plusieurs réponses par question

            allOptions.forEach(option => {
                const btn = document.createElement('button');
                btn.className = 'gtw-choice';
                btn.textContent = formatTitle(option.name);
                btn.addEventListener('click', () => {
                    if (answered) return; // ignore si déjà répondu
                    answered = true;

                    const isCorrect = btn.textContent.toLowerCase() === formatTitle(gameData.correctName).toLowerCase();
                    
                    feedback.textContent = isCorrect ? '🎉 Bonne réponse !' : '❌ Ce n’est pas ça...';
                    feedback.classList.add('show');

                    // Optionnel : ajoute une classe pour couleur/vibration selon correct ou pas
                    btn.classList.add(isCorrect ? 'correct' : 'incorrect');

                    // Mise à jour du jeu
                    gameData.current++;
                    gameData.streak = isCorrect ? gameData.streak + 1 : 0;

                    // Mise à jour scoreboard
                    board.querySelector('.gtw-info').textContent = 
                        `Question ${Math.min(gameData.current, gameData.total)}/${gameData.total}`;
                    board.querySelector('.gtw-progress-bar').style.width =
                        `${((gameData.current - 1) / gameData.total) * 100}%`;

                    // Après délai, préparer la question suivante (ou fin du jeu)
                    setTimeout(() => {
                        feedback.classList.remove('show');
                        btn.classList.remove('correct', 'incorrect');
                        answered = false;
                        // Ici tu peux rappeler ta fonction de chargement de question pour continuer
                        // Exemple : startGuessTheWebtoonGame(gameData.difficulty);
                        // Ou afficher écran final si current > total
                    }, 1500);
                });
                choicesContainer.appendChild(btn);
            });


            // === 10) Apparition animée ===
            setTimeout(() => popup.classList.add('gtw-visible'), 10);

        } catch (error) {
            console.error("Erreur de chargement :", error);
        }
    }


});



/*
prochaines étapes :
- Pb qu'une seule image et qcm
- Permettre de cliquer sur l'image pour l'agrandir, avec un bouton croix pour fermer l'image et un autre pour upload l'image.
- Peut-être mettre les propositions sur 2 lignes. 2 par 2
- Augmenter la taille de l'image sur les petits écrans
- Trouver une icône pour mon site Guillaume Marolleau "Tous mes projets"
- Son : quand le joueur clique sur une catégorie, et quand il clique sur "JOUER"
- Régler,problème de clé API visible.


Faire un toggle pour l'apparition de l'entièreté du jeu "Guess The Webtoon"

Autour du plateau de jeu :
- Prendre une mascotte (préférence barbare Bjorn fisl de Yandel), et déterminer en image à l'aide de l'IA ses différentes expressions
- Motifs autour du plateau (bulles, effets de papier, cadres illustrés)


- Prendre le json correspondant à la catégorie, et pour les autres réponses "fausses". Pour la réponse "bonne", il faudra utiliser le chemin du nom du fichier, qui comprend directement le nom du webtoon.
- Ma méthode est-elle bonne, ou y a t il une méthode plus simple et efficace ?

AUTRE :
- faire une catégorie "eyes" et "personnage flouté ou couverture floutée"
*/