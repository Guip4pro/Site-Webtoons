// Fonction de mélange aléatoire d'un tableau (Fisher-Yates simplifié)
function shuffleArray(array) {
    return array
        .map(value => ({ value, sort: Math.random() })) // Associe chaque valeur à un nombre aléatoire
        .sort((a, b) => a.sort - b.sort) // Trie selon ce nombre
        .map(({ value }) => value); // Retourne le tableau trié
}


let firstCard = null;   // Mémorise la première carte cliquée
let secondCard = null;  // Mémorise la deuxième carte cliquée
let lockBoard = true;   // Empêche les clics pendant certaines opérations
let matchedPairs = 0;   // Compte les paires trouvées
let countdownInterval = null;   // Variable qui sera utilisée effacer le countdown précédent 
let currentCards = [];  // Liste des cartes actuellement affichées

function startMemoryGame() {
    const memoryGame = document.getElementById('memory-game');
    const difficultySelector = document.getElementById('memory-difficulty-selector');

    memoryGame.classList.remove('memory-hidden');   // Affiche le plateau de jeu
    difficultySelector.classList.remove('hidden');  // Affiche le sélecteur de difficulté

    updateGameBoard();  // Charge le niveau par défaut
}

    // async rend la fonction asynchrone → permet d'utiliser 'await' pour attendre attendre que les opérations lentes se terminent (ici le chargement de mon json)
async function updateGameBoard() {
        // Stoppe un ancien décompte s'il existe
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    // Récupère les éléments du DOM
    const difficulty = document.getElementById('difficulty').value;
    const gameBoard = document.getElementById('memory-game-board');

    // Réinitialise l'état du jeu
    gameBoard.innerHTML = "";
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = true;
    currentCards = [];

    // Calcule les dimensions du plateau (ex: 4x4, 6x6...)
    let [rows, cols] = difficulty.split('x').map(Number);
    const totalCards = rows * cols;
    const numPairs = totalCards / 2;

    try {
        // Charge les images depuis un fichier JSON
        const response = await fetch("../RESSOURCES/data-json/img-memory.json");
        const memoryImages = await response.json();

        // Sélectionne aléatoirement des images à doubler
        const selectedImages = shuffleArray(memoryImages).slice(0, numPairs);
        const pairedImages = shuffleArray([...selectedImages, ...selectedImages]);

        // Applique la grille CSS
        gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        // Crée un fragment pour optimiser les ajouts au DOM
        const fragment = document.createDocumentFragment();

        // Crée les cartes dynamiquement
        pairedImages.forEach((imgData) => {
            const card = document.createElement('div');
            card.classList.add('memory-card', 'no-hover'); // Désactive le hover
            card.dataset.image = imgData.src;              // Pour vérifier les paires
            card.dataset.flipped = "false";                // État de retournement

            // Face cachée
            const backImg = document.createElement('img');
            backImg.src = "../RESSOURCES/img-memory/img-dos.jpg";
            backImg.alt = "Image de dos";
            backImg.classList.add('card-back');

            // Face visible (image réelle)
            const frontImg = document.createElement('img');
            frontImg.src = imgData.src;
            frontImg.alt = imgData.alt;
            frontImg.classList.add('card-front');
            frontImg.style.display = 'block';

            // Ajoute les images à la carte
            card.append(backImg, frontImg);
            fragment.appendChild(card);

            // Gère le clic sur chaque carte
            card.addEventListener('click', () => handleCardClick(card, numPairs));
            currentCards.push(card);
        });

        // Ajoute toutes les cartes d’un coup au plateau
        gameBoard.appendChild(fragment);

        // Affiche le compte à rebours initial
        const countdownElement = document.getElementById('memory-countdown');
        let countdown = 5;
        countdownElement.textContent = countdown;
        countdownElement.classList.remove('hidden');

        // Affiche toutes les cartes face visible pendant le compte à rebours
        currentCards.forEach(card => {
            card.querySelector('.card-back').style.display = 'none';
            card.querySelector('.card-front').style.display = 'block';
        });

        // Lancement du compte à rebours
        countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;

            // Quand le compte à rebours est terminé
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                countdownElement.classList.add('hidden');

                // Retourne toutes les cartes face cachée
                currentCards.forEach(card => {
                    unflipCard(card);
                    card.classList.remove('no-hover'); // Réactive le hover
                });

                lockBoard = false; // Autorise les clics
            }
        }, 1000);

    } catch (error) {
        console.error("Erreur lors du chargement des images :", error);
    }
}

// Gère le clic sur une carte
function handleCardClick(card, numPairs) {
    // Ignore les clics si bloqué ou si carte déjà trouvée
    if (lockBoard || card.dataset.flipped === "true") return;

    flipCard(card); // Affiche la carte

    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        lockBoard = true; // Bloque jusqu'à résolution de la paire

        // Si c’est une paire
        if (firstCard.dataset.image === secondCard.dataset.image) {
            firstCard.dataset.flipped = secondCard.dataset.flipped = "true";
            firstCard.classList.add('found');
            secondCard.classList.add('found');
            matchedPairs++;
            resetTurn();

            // Si toutes les paires sont trouvées
            if (matchedPairs === numPairs) {
                setTimeout(() => alert("🎉 Bravo ! Tu as gagné !"), 500);
            }
        } else {
            // Sinon, retourne les cartes après un court délai
            setTimeout(() => {
                unflipCard(firstCard);
                unflipCard(secondCard);
                resetTurn();
            }, 1000);
        }
    }
}

// Affiche la face avant d'une carte
function flipCard(card) {
    card.querySelector('.card-back').style.display = 'none';
    card.querySelector('.card-front').style.display = 'block';
}

// Cache la carte (face arrière)
function unflipCard(card) {
    card.querySelector('.card-back').style.display = 'block';
    card.querySelector('.card-front').style.display = 'none';
}

// Réinitialise les cartes sélectionnées
function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}


/*
    5. Bonus (facultatif mais cool) :

    Bug : je ne suis pas sûr, mais j'ai l'impression que c'est depuis que j'ai fait des modifications dans le css concernant l "invisibilisation" du selecteur de difficulté que l'alert dans le js ne fonctionne plus pour les niveaux autre que le niveau "très facile"

    Modifier les noms des niveaux de difficultés 'Très facile, 8 paires (4x4)'

    ⏱️ Chronomètre (temps écoulé).

    📈 Compteur de coups / essais.

    💫 Animations au retournement de carte.

    🔊 Effets sonores (optionnels).

    Système de classement entre les joueurs

    Jeu à 2 joueurs
*/