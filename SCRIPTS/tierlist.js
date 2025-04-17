// Fonction de mélange (jsp comment elle fonctionne)
function shuffleArray(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

let firstCard = null;
let secondCard = null;
let lockBoard = true;
let matchedPairs = 0;
let countdownInterval = null;
let currentCards = [];

function startMemoryGame() {
    const memoryGame = document.getElementById('memory-game');
    const difficultySelector = document.getElementById('memory-difficulty-selector');

    memoryGame.classList.remove('memory-hidden');
    difficultySelector.classList.remove('hidden');

    updateGameBoard();
}

async function updateGameBoard() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    const difficulty = document.getElementById('difficulty').value;
    const gameBoard = document.getElementById('memory-game-board');

    gameBoard.innerHTML = "";
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = true;
    currentCards = [];

    let [rows, cols] = difficulty.split('x').map(Number);
    const totalCards = rows * cols;
    const numPairs = totalCards / 2;

    try {
        const response = await fetch("../RESSOURCES/data-json/img-memory.json");
        const memoryImages = await response.json();

        const selectedImages = shuffleArray(memoryImages).slice(0, numPairs);
        const pairedImages = shuffleArray([...selectedImages, ...selectedImages]);

        gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        const fragment = document.createDocumentFragment();

        pairedImages.forEach((imgData) => {
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

            card.addEventListener('click', () => handleCardClick(card, numPairs));
            currentCards.push(card);
        });

        gameBoard.appendChild(fragment);

        const countdownElement = document.getElementById('memory-countdown');
        let countdown = 5;
        countdownElement.textContent = countdown;
        countdownElement.classList.remove('hidden');

        currentCards.forEach(card => {
            card.querySelector('.card-back').style.display = 'none';
            card.querySelector('.card-front').style.display = 'block';
        });

        countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                countdownElement.classList.add('hidden');

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
    flipCard(card);
    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        lockBoard = true;
        if (firstCard.dataset.image === secondCard.dataset.image) {
            firstCard.dataset.flipped = secondCard.dataset.flipped = "true";
            firstCard.classList.add('found');
            secondCard.classList.add('found');
            matchedPairs++;
            resetTurn();
            if (matchedPairs === numPairs) {
                setTimeout(() => alert("🎉 Bravo ! Tu as gagné !"), 500);
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
