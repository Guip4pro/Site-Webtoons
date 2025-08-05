

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
subAccordions.forEach((subAcc) => {
    // Ajout de la flèche initiale
    subAcc.textContent = `▸ ${subAcc.textContent.trim()}`;

    subAcc.addEventListener('click', () => {
        const subPanel = subAcc.nextElementSibling;
        const isOpen = subPanel.style.display === 'flex';

        subPanel.style.display = isOpen ? 'none' : 'flex';
        subAcc.textContent = isOpen ? `▸ ${subAcc.textContent.slice(2).trim()}` : `▾ ${subAcc.textContent.slice(2).trim()}`;
    });
});



/*
prochaines étapes :
- M'occuper des boutons pour choisir son mode de jeu de Guess The Webtoon
- Designer mon menu de jeu, juste avant de lancer une partie
    |-->    Prompt Chatgpt : 




Faire un toggle pour l'apparition de l'entièreté du jeu "Guess The Webtoon"

Autour du plateau de jeu :
- Mascotte qui donne des conseils ou réagit
- Motifs autour du plateau (bulles, effets de papier, cadres illustrés)
- Optionnel : (Fond changeant selon le thème (ex : nuit / jour / manga / fantasy))

Dans mon plateau de jeu :
- Faire l'encadré d'affichage, mais avec un bouton start (pas de lancement automatique)
- Mettre un encadré consigne / explication avec mascotte Ex :
    (en GRAS) **Prêt à tester tes connaissances ?**
    Tu auras **15s** pour retrouver le nom du **webtoon** correspondant à l'image parmi 4 propositions.
    Fais le bon choix et prouve ta valeur !
- Score-board
- Sons
- Boutons valider et passer en bas
*/