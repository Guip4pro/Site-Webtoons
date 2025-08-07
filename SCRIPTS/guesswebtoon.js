

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
            startGuessTheWebtoonGame();     // Fonction lançant le vrai jeu
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
- Son : quand le joueur clique sur une catégorie, et quand il clique sur "JOUER"


Faire un toggle pour l'apparition de l'entièreté du jeu "Guess The Webtoon"

Autour du plateau de jeu :
- Prendre une mascotte (préférence barbare Bjorn fisl de Yandel), et déterminer en image à l'aide de l'IA ses différentes expressions
- Motifs autour du plateau (bulles, effets de papier, cadres illustrés)




PROMPT !!! (utiliser "raisonner"):

Je souhaite créer la seconde page d'un jeu en ligne appelé "Devine le Webtoon", qui s'affiche après que l'utilisateur ait cliqué sur le bouton "JOUER" dans une première pop-up d'introduction.

Cette nouvelle page (toujours en pop-up) est l'espace de jeu principal, et doit reprendre le même style premium que la première :

Design noble et raffiné (matériaux luxueux, touches dorées)

Arrière-plan mystique

Animations subtiles, ombrages doux

Feedback visuels et sonores "haut de gamme"

Responsive et moderne

✅ À inclure dans cette interface de jeu :
🔷 En-tête (header) :
Un titre principal ("Devine le Webtoon")

Une croix de fermeture à droite

La difficulté sélectionnée (ex : "Facile", "Moyen", etc.)

🔷 Scoreboard :
Barre de progression (représentant l’avancée sur 10 questions)

Un texte dynamique de type : "Question 3/10"

Un winstreak indicator avec un émoji 🔥 suivi de : "Streak : x3"

🔷 Corps du jeu :
Une image mystère (représentant le Webtoon à deviner)

Une liste de choix (QCM) sous forme de boutons ou éléments interactifs

Un bouton "Valider" en bas

🔷 Feedback joueur :
Message animé :

Bonne réponse → "🎉 Bonne réponse !"

Mauvaise réponse → "❌ Ce n’est pas ça..."

Petites animations du fond ou de l’élément (ex : vibration en cas d’erreur)

Effets sonores pour les réponses correctes / incorrectes

🏁 Écran final après 10 questions :
Résumé des résultats :

Nombre de Webtoons devinés vs ratés

Record de winstreak pendant cette partie

Message de fin personnalisé :

10/10 à 6/10 → Félicitations ("Tu es un maître des Webtoons !")

5/10 → Message neutre

4/10 à 1/10 → Message de déception douce

0/10 → Message de grosse déception (humoristique ou piquant)

Mascotte aléatoire selon le score (choisie parmi 4 catégories)

Boutons :

"Rejouer"

"Partager mon score"

📦 Bonus :
L’ensemble doit rester cohérent avec la pop-up initiale, mais s’adapter à ce nouveau contexte interactif de quiz. Les transitions doivent être douces, élégantes, premium.

🎨 Tu peux te laisser une part de créativité pour améliorer l'interface ou l'expérience si certaines idées te viennent.

⚙️ Enfin, ce prompt concerne uniquement la partie design et affichage (HTML/CSS/JS côté front). La logique de gestion des données (comme le JSON des questions, le système de validation, ou le compteur de réponses) sera intégrée plus tard : tu peux donc utiliser des placeholders ({{question}}, {{choices}}, etc.) sans problème.

Et enfin, après avoir écrit ton prompt, j'aimerais te poser une question : là ce que ce prompt va faire, c'est éssentiellement s'occuper de l'affichage, cet aspect design. Mais il faut qu'il y ait un système pour gérer le json, etc...Je veux juste savoir si cela posera problème lors de la création de l'affichage ?




- Prendre le json correspondant à la catégorie, et pour les autres réponses "fausses". Pour la réponse "bonne", il faudra utiliser le chemin du nom du fichier, qui comprend directement le nom du webtoon.
- Ma méthode est-elle bonne, ou y a t il une méthode plus simple et efficace ?

AUTRE :
- faire une catégorie "eyes" et "personnage flouté ou couverture floutée"
*/