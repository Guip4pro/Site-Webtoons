

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
}

window.startGuessTheWebtoon = startGuessTheWebtoon;