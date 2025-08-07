

function startGuessTheWebtoon() {
    const gameContainer = document.getElementById('memory-game');
    gameContainer.classList.add('hidden');
    gameContainer.classList.remove('fade-in');
    document.getElementById('memory-difficulty-selector').classList.add('hidden');
    document.getElementById('memory-stats').classList.add('hidden');
    document.getElementById('leaderboard-section').classList.add('hidden');

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
});



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
            <img src="../RESSOURCES/background-mini-jeux.jpg" alt="Mascotte" class="gtw-mascotte" />
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
            startGuessTheWebtoonGame(); // Cette fonction doit exister quelque part
        });
    };
}



function startGuessTheWebtoonGame() {
    console.log("Le jeu Guess the Webtoon commence ici !");

}




/*
prochaines étapes :
- Designer mon menu de jeu, juste avant de lancer une partie
    |-->    Prompt Chatgpt : 
- Montrer que c'est ce mode de jeu qui a été sélectionné


Faire un toggle pour l'apparition de l'entièreté du jeu "Guess The Webtoon"

Autour du plateau de jeu :
- Mascotte qui donne des conseils ou réagit
- Motifs autour du plateau (bulles, effets de papier, cadres illustrés)

Dans mon affichage d'avant-jeu :
- En-tête "Guess the Webtoon" ou "Devine le webtoon"
- Une croix pour fermer la pop-up à droite du titre
- Rappel de la difficulté choisie, avec un visuel ou une couleur différente. (ex : "MOYEN")
- Mettre un encadré consigne / explication avec mascotte Ex :
    (en GRAS) **Prêt à tester tes connaissances ?**
    Tu auras **15s** pour retrouver le nom du **webtoon** correspondant à l'image parmi 4 propositions.
- Un bouton start (pas de lancement automatique)
- Petit son et effet simple au démarrage de la pop-up
- Exemple illustratif (facultatif) : Montrer une image "brouillée" ou un exemple pour donner une idée.

Deuxième plateau de jeu :
- Score-board : Il n'y aura pas vraiment de score, mais une barre de progression avec un chiffre inqiquant à combien de webtoon est le joueur sur 10.
- Pendant le jeu, le joueur pourra savoir le nombre de webtoons qu'il a réussi à deviner, ainsi que le nombre de webtoon qu'il n'a pas réussi à deviner.
- Sons
- Boutons valider et passer en bas
*/