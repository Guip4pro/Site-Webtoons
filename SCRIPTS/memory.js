    // Fonction de mélange (jsp comment elle fonctionne)
function shuffleArray(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}


let firstCard = null;         // Mémorise la première carte cliquée
let secondCard = null;        // Mémorise la deuxième carte cliquée
let lockBoard = true;         // Empêche les clics pendant certaines opérations
let matchedPairs = 0;         // Compte les paires trouvées

function startMemoryGame() {
    const memoryGame = document.getElementById('memory-game');
    const difficultySelector = document.getElementById('memory-difficulty-selector');

    memoryGame.classList.remove('memory-hidden');  // Affiche le plateau de jeu
    difficultySelector.classList.remove('hidden'); // Affiche le sélecteur de difficulté

    updateGameBoard(); // Charge le niveau par défaut
}

    // async rend la fonction asynchrone → permet d'utiliser 'await' pour attendre attendre que les opérations lentes se terminent (ici le chargement de mon json)
async function updateGameBoard() {
    const difficulty = document.getElementById('difficulty').value; // Récupère la difficulté sélectionnée
    const gameBoard = document.getElementById('memory-game-board'); // Récupère l'id du tableau de jeu
    gameBoard.innerHTML = "";   // Vide le tableau de jeu (efface tout)

    let [rows, cols] = difficulty.split('x').map(Number);   // Convertit la difficulté en tableau de dimensions (ex : convertit "4x4" en [4, 4])
    const totalCards = rows * cols;
    const numPairs = totalCards / 2;    // nb de paires
    matchedPairs = 0; // Reset le compteur de paires

    try {
        const response = await fetch("../RESSOURCES/data-json/img-memory.json");    // Récupère le json
        const memoryImages = await response.json(); // Le convertit en objet JavaScript

        const selectedImages = shuffleArray(memoryImages).slice(0, numPairs);   // Choisit au hasard "numPairs" images différentes
        const pairedImages = shuffleArray([...selectedImages, ...selectedImages]);  // Crée les paires à partir de ces images, puis les mélange

        gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        pairedImages.forEach((imgData, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');

            const backImg = document.createElement('img');
            backImg.src = "../RESSOURCES/img-memory/img-dos.jpg";
            backImg.alt = "Image de dos";
            backImg.classList.add('card-back');

            const frontImg = document.createElement('img');
            frontImg.src = imgData.src;
            frontImg.alt = imgData.alt;
            frontImg.classList.add('card-front');
            frontImg.style.display = 'block'; // Affiché au début

            card.appendChild(backImg);
            card.appendChild(frontImg);

            card.dataset.image = imgData.src; // Stocke l'image pour comparaison
            card.dataset.flipped = "false"; // État de la carte (retournée ou pas)
            card.classList.add('no-hover'); // désactive l'effet hover au début

            // Ajoute au plateau
            gameBoard.appendChild(card);

            // Ajoute l'événement de clic à la carte
            card.addEventListener('click', () => {
                if (lockBoard || card.dataset.flipped === "true") return;

                flipCard(card);

                if (!firstCard) {
                    firstCard = card;
                } else {
                    secondCard = card;
                    lockBoard = true;

                    if (firstCard.dataset.image === secondCard.dataset.image) {
                        // Paire trouvée
                        firstCard.dataset.flipped = "true";
                        secondCard.dataset.flipped = "true";

                        firstCard.classList.add('found');
                        secondCard.classList.add('found');

                        matchedPairs++;
                        resetTurn();
                    
                        // Vérifie si le jeu est gagné
                        if (matchedPairs === numPairs) {
                            setTimeout(() => {
                                alert("🎉 Bravo ! Tu as gagné !");
                            }, 500);
                        }
                    } else {
                        // Pas une paire → on retourne les cartes après un délai
                        setTimeout(() => {
                            unflipCard(firstCard);
                            unflipCard(secondCard);
                            resetTurn();
                        }, 1000);
                    }
                }
            });
        });

            // Récupérer l'élément de compte à rebours
        const countdownElement = document.getElementById('memory-countdown');
        countdownElement.classList.remove('hidden'); // Affiche le compte à rebours

        let countdown = 5;
        countdownElement.textContent = countdown;

        // Démarre le compte à rebours visuel
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownElement.textContent = countdown;
            } else {
                clearInterval(countdownInterval);
                countdownElement.classList.add('hidden'); // Cache le compte à rebours quand terminé
            }
        }, 1000);


        // Affiche toutes les cartes pendant 5 secondes, puis les cache
        setTimeout(() => {
            document.querySelectorAll('.memory-card').forEach(card => {
                const frontImg = card.querySelector('.card-front');
                const backImg = card.querySelector('.card-back');
                frontImg.style.display = 'none';
                backImg.style.display = 'block';

                card.classList.remove('no-hover'); // réactive effet hover
            });
            lockBoard = false; // Active les clics
        }, 5000);

    } catch (error) {
        console.error("Erreur lors du chargement des images :", error);
    }
}

// Retourner une carte
function flipCard(card) {
    card.querySelector('.card-back').style.display = 'none';
    card.querySelector('.card-front').style.display = 'block';
}

// Revenir à l'état caché
function unflipCard(card) {
    card.querySelector('.card-back').style.display = 'block';
    card.querySelector('.card-front').style.display = 'none';
}

// Réinitialise les variables pour un nouveau tour
function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

/*
    Je dois afficher 5s les cartes retournées au début du jeu

    5. Bonus (facultatif mais cool) :
    ⏱️ Chronomètre (temps écoulé).

    📈 Compteur de coups / essais.

    🔁 Bouton “Rejouer”.

    💫 Animations au retournement de carte.

    🔊 Effets sonores (optionnels).

    Système de classement entre les joueurs

    Jeu à 2 joueurs
*/