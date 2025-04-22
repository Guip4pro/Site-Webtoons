// Fonction de mélange aléatoire d'un tableau (Fisher-Yates simplifié)
function shuffleArray(array) {
    return array
        .map(value => ({ value, sort: Math.random() })) // Associe chaque valeur à un nombre aléatoire
        .sort((a, b) => a.sort - b.sort)               // Trie selon cette valeur
        .map(({ value }) => value);                    // Retourne le tableau trié
}

let firstCard = null;        // Première carte retournée
let secondCard = null;       // Deuxième carte retournée
let lockBoard = true;        // Verrouillage du plateau
let matchedPairs = 0;        // Paires trouvées
let countdownInterval = null;// Intervalle du compte à rebours initial
let timerInterval = null;    // Intervalle du chronomètre
let currentCards = [];       // Liste des cartes affichées
let moveCount = 0;           // Compteur de coups
let timer = 0;               // Chronomètre en secondes
let gameStarted = false;     // Indique si le chrono a démarré

    // Récupération des balises <audio> en centralisant tout dans 1 seule variable "sounds"
const sounds = {
    countdown: document.getElementById('sound-countdown'),  // clé1, valeur1
    flip:      document.getElementById('sound-flip'),
    match:     document.getElementById('sound-match'),
    win:       document.getElementById('sound-win')
};

const svgOn = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    class="lucide lucide-volume2-icon lucide-volume-2">
    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>
    <path d="M16 9a5 5 0 0 1 0 6"/>
    <path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>
</svg>
`;

const svgOff = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    class="lucide lucide-volume-off-icon lucide-volume-off">
    <path d="M16 9a5 5 0 0 1 .95 2.293"/><path d="M19.364 5.636a9 9 0 0 1 1.889 9.96"/>
    <path d="m2 2 20 20"/>
    <path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11"/>
    <path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686"/>
    </svg>
`;  // Lien des svg : https://lucide.dev/icons/volume-2 et https://lucide.dev/icons/volume-off

let soundEnabled = true;    // Lorsque false, plus de son
const button = document.getElementById('toggle-sound');

button.innerHTML = svgOn; // icône initiale

button.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  button.innerHTML = soundEnabled ? svgOn : svgOff;
});



function playSound(type) {
if (!soundEnabled) return;  // Si le son est désactivé, on ne joue rien
const s = sounds[type];
if (!s) return;
s.currentTime = 0;  // Rejoue le son depuis le début
s.play();   // Lance le son
}
  

function startMemoryGame() {
    const gameContainer = document.getElementById('memory-game'); // ← cette ligne manquait
    gameContainer.classList.remove('memory-hidden');
    gameContainer.classList.add('fade-in');
    document.getElementById('memory-difficulty-selector').classList.remove('hidden');
    document.getElementById('memory-stats').classList.remove('hidden');
    updateGameBoard();
}

async function updateGameBoard() {
    playSound('countdown');  // son chaque seconde
    // Nettoyage des anciens intervalles
    if (countdownInterval) clearInterval(countdownInterval);
    if (timerInterval) clearInterval(timerInterval);
    countdownInterval = null;
    timerInterval = null;

    // Réinitialisation des stats
    moveCount = 0;
    timer = 0;
    gameStarted = false;
    document.getElementById('memory-moves').textContent = moveCount;
    document.getElementById('memory-timer').textContent = timer;

    // Récupération du DOM
    const difficulty = document.getElementById('difficulty').value;
    const gameBoard = document.getElementById('memory-game-board');
    const countdownElement = document.getElementById('memory-countdown');

    // Réinitialisation du plateau
    gameBoard.innerHTML = "";
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = true;
    currentCards = [];

    // Calcul des dimensions et du nombre de paires
    const [rows, cols] = difficulty.split('x').map(Number);
    const totalCards = rows * cols;
    const numPairs = totalCards / 2;

    try {
        const response = await fetch("../RESSOURCES/data-json/img-memory.json");
        const memoryImages = await response.json();
        const selectedImages = shuffleArray(memoryImages).slice(0, numPairs);
        const pairedImages = shuffleArray([...selectedImages, ...selectedImages]);

        // Mise en place de la grille
        gameBoard.style.display = 'grid';
        gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        gameBoard.style.gap = '10px';

        // Création et insertion des cartes
        const fragment = document.createDocumentFragment();
        pairedImages.forEach(imgData => {
            const card = document.createElement('div');
            card.classList.add('memory-card', 'no-hover');
            card.dataset.image = imgData.src;
            card.dataset.flipped = "false";

            const backImg = document.createElement('img');
            backImg.src = "../RESSOURCES/img-memory/img-dos.jpg";
            backImg.alt = "Image de dos";
            backImg.classList.add('card-back');

            const frontImg = document.createElement('img');
            frontImg.src = imgData.src;
            frontImg.alt = imgData.alt;
            frontImg.classList.add('card-front');
            frontImg.style.display = 'block';

            card.append(backImg, frontImg);
            fragment.appendChild(card);
            currentCards.push(card);

            card.addEventListener('click', () => handleCardClick(card, numPairs));
        });
        gameBoard.appendChild(fragment);

        // Compte à rebours avant démarrage

        let countdown = 5;
        countdownElement.textContent = countdown;
        countdownElement.classList.remove('hidden');
        currentCards.forEach(flipCard);
        

        countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            // Ancien sound-countdown
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                countdownElement.classList.add('hidden');

                // Cache les cartes et active le jeu
                currentCards.forEach(card => {
                    unflipCard(card);
                    card.classList.remove('no-hover');
                });
                lockBoard = false;
            }
        }, 1000);

    } catch (error) {
        console.error("Erreur lors du chargement des images :", error);
    }
}

function handleCardClick(card, numPairs) {
    if (lockBoard || card.dataset.flipped === "true") return;

    if (!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(() => {
            timer++;
            document.getElementById('memory-timer').textContent = timer;
        }, 1000); // Démarre le chrono au premier clic
    }
    playSound('flip');
    flipCard(card);

    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        lockBoard = true;
        moveCount++;
        document.getElementById('memory-moves').textContent = moveCount;

        if (firstCard.dataset.image === secondCard.dataset.image) {
            firstCard.dataset.flipped = secondCard.dataset.flipped = "true";
            firstCard.classList.add('found');
            secondCard.classList.add('found');
            matchedPairs++;
            playSound('match');
            resetTurn();
            if (matchedPairs === numPairs) {
                clearInterval(timerInterval);
                playSound('win');
                showModal(`🎉 <strong>Congratulations!</strong><br>⏱️ Temps : ${timer}s • 🎯 Coups : ${moveCount}`);
            }
        } else {
            setTimeout(() => {
                unflipCard(firstCard);
                unflipCard(secondCard);
                resetTurn();
            }, 1000);
        }
    }
}

function flipCard(card) {
    card.querySelector('.card-back').style.display = 'none';
    card.querySelector('.card-front').style.display = 'block';
}

function unflipCard(card) {
    card.querySelector('.card-back').style.display = 'block';
    card.querySelector('.card-front').style.display = 'none';
}

function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

  
function showModal(messageHTML) {
    const overlay = document.getElementById('modal-overlay');
    const message = document.getElementById('modal-message');
  
    message.innerHTML = messageHTML;

    // Affiche le modal
    overlay.classList.remove('modal-hidden');
    overlay.classList.add('show');

    // Ferme après 15 secondes automatiquement
    setTimeout(() => {
        closeModal();
    }, 15000);

    // Ferme si clic à l’extérieur du modal
    overlay.addEventListener('click', (e) => {
        console.log("Clic détecté sur l'overlay !");
        if (e.target === overlay) {
            closeModal();
        }
    });
}


function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('show');
    
    // Ajoute un délai pour laisser le temps à l'animation de se terminer (300ms)
    setTimeout(() => {
        overlay.classList.add('modal-hidden');
    }, 300);
}







  
  



/*
    5. Tâches :

    Fix le bug : quand dje clique 2 fois d'affilée sur la même carte, cela compte comme une paire trouvée. Ce qui est de la triche

    Déplacer l'écran de l'utilisateur au moment où il clique sur le bouton du memory

    Régler pb de synchro du son "countdown" à la première partie du Memory
    Régler le pb de désactivation du son qui ne désactive pas le son "countdown" en cours

    💫 Animations au retournement de carte.

    Système de classement entre les joueurs :
    - A la fin de la partie, demander le nom du joueur s'il ne l'a pas déjà rentré auparavant
    - Classement en ligne (via une base de données + back-end léger), prend en compte le pseudo du joueur, le niveau de difficulté, le nombre de coups / le temps, la date
    - Envoyer les infos à cette API, puis les récup
    - Demander à Chatgpt des conseils pour améliorer ce classement
    - Sûrement avec Firebase (simple et rapide)

    Code responsive (adapté à d'autres tailles d'écran)

    Jeu à 2 joueurs
*/