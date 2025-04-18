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

function startMemoryGame() {
    const gameContainer = document.getElementById('memory-game'); // ← cette ligne manquait
    gameContainer.classList.remove('memory-hidden');
    gameContainer.classList.add('fade-in');
    document.getElementById('memory-difficulty-selector').classList.remove('hidden');
    document.getElementById('memory-stats').classList.remove('hidden');
    updateGameBoard();
}

async function updateGameBoard() {
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
                // Le chrono démarre au premier clic maintenant
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
            resetTurn();
            if (matchedPairs === numPairs) {
                clearInterval(timerInterval);
                setTimeout(() => alert(`🎉 Bravo ! Tu as gagné en ${moveCount} coups et ${timer} secondes !`), 500);
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



/*
    5. Bonus (facultatif mais cool) :

    🔊 Effets sonores (optionnels).

    Modifier Temps et Coups pour un meilleur esthétisme (les séparer) + aligner ces 2-là et avec le sélecteur de niv de difficulté

    💫 Animations au retournement de carte.

    Système de classement entre les joueurs :
    - A la fin de la partie, demander le nom du joueur s'il ne l'a pas déjà rentré auparavant
    - Classement en ligne (via une base de données + back-end léger), prend en compte le pseudo du joueur, le niveau de difficulté, le nombre de coups / le temps, la date
    - Envoyer les infos à cette API, puis les récup
    - Demander à Chatgpt des conseils pour améliorer ce classement
    - Sûrement avec Firebase (simple et rapide)

    Jeu à 2 joueurs

    Code responsive (adapté à d'autres tailles d'écran)
*/