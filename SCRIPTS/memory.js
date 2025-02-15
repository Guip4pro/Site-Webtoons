function startMemoryGame() {
    const memoryGame = document.getElementById('memory-game');
    memoryGame.classList.remove('memory-hidden');
    updateGameBoard(); // Charge le niveau par défaut
}

function updateGameBoard() {
    const difficulty = document.getElementById('difficulty').value;    // .value récupère la valeur actuellement sélectionnée dans le menu déroulant, comme "4x4"
    const gameBoard = document.getElementById('memory-game-board');
    gameBoard.innerHTML = ""; // Réinitialise le plateau

    let [rows, cols] = difficulty.split('x').map(Number);   // découpe la valeur de difficulté (comme "4x4") en [4, 4], ce qui correspond à [rows, cols]
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let i = 0; i < rows * cols; i++) {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.textContent = "?"; // Placeholder pour les cartes. Le ? sur l'image de dos des cartes
        gameBoard.appendChild(card);    // ajoute chaque carte créée à l'intérieur du conteneur memory-game-board
    }
}
