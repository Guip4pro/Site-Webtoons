// Importe les fonctions nécessaires des SDK Firebase (version modulaire)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
// import { getPerformance } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-performance.js";
// Pour l'authentification :
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
// Pour la base de données Firestore :
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
// Pour la base de données Realtime Database (si tu la préfères) :
// import { getDatabase } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


// Ta configuration de l'application web Firebase (console)
const firebaseConfig = {
    apiKey: "AIzaSyCvCYaSY8GhIa6JJ8zQrSC1nf92jf3qWeI",
    authDomain: "memory-leaderboard.firebaseapp.com",
    projectId: "memory-leaderboard",
    storageBucket: "memory-leaderboard.firebasestorage.app",
    messagingSenderId: "357999637015",
    appId: "1:357999637015:web:e65863fef0f1d386bde252",
    measurementId: "G-6Z2J33EWJK" // Google Analytics
};

// 1. Initialise Firebase AVEC LA VERSION MODULAIRE
const app = initializeApp(firebaseConfig);

// 2. Initialise les services spécifiques et obtiens une référence
const analytics = getAnalytics(app);    // Initialiser Analytics en lui donnant mon application Firebase
const auth = getAuth(app);           // Pour l'authentification, pour co et déco les joueurs
const db = getFirestore(app);        // Pour ajouter / récupérer le score des joueurs. Objet principal de ma base Firestore
// Ou si tu utilises Realtime Database :
// const database = getDatabase(app);

// 3. Maintenant, tu peux écrire le reste de ton code JavaScript
// et utiliser les variables 'auth', 'db', etc., pour interagir avec Firebase.
console.log("Firebase initialisé for the Memory leaderboard");
// Exemple :
// auth.onAuthStateChanged(user => {
//     if (user) {
//         console.log("Utilisateur connecté :", user.email);
//     } else {
//         console.log("Aucun utilisateur connecté.");
//     }
// });

// Exemple : Quand un joueur soumet son score
logEvent(analytics, 'score_submitted', {
  difficulty: 'facile',
  moves: 12,
  time: 60,
  pseudo: 'MonSuperPseudo'
});

// Exemple : Quand un utilisateur démarre une nouvelle partie
logEvent(analytics, 'new_game_started', {
  difficulty: 'difficile'
});



document.addEventListener("DOMContentLoaded", () => {
    // Quand le HTML est complètement chargé, on peut accéder aux éléments

    // Pour le firebase
    document.getElementById("difficulty-selector").addEventListener("change", (e) => {
        const selectedDifficulty = e.target.value;
        afficherClassementPour(selectedDifficulty);
    });

    // Classement par défaut au chargement
    afficherClassementPour("4x4");
});



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
    countdown: document.getElementById('sound-countdown'),  // key1, valeur1
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

// Icône initiale
button.innerHTML = svgOn;

// Un seul écouteur pour toggler le son et arrêter les éventuels sons en cours
button.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  button.innerHTML = soundEnabled ? svgOn : svgOff;

  if (!soundEnabled) {
    // Si on désactive le son, on stoppe tous les sons en cours
    for (const key in sounds) {
      const sound = sounds[key];
      if (!sound.paused) {
        sound.pause();         // Arrête le son
        sound.currentTime = 0; // Le remet au début
      }
    }
  }
});

function playSound(type) {
    if (!soundEnabled) return;  // Si le son est désactivé, on ne joue rien
    const s = sounds[type];
    if (!s) return;
    s.currentTime = 0;  // Rejoue le son depuis le début
    s.play();   // Lance le son
}

  

function startMemoryGame() {
    const gameContainer = document.getElementById('memory-game');
    gameContainer.classList.remove('memory-hidden');
    gameContainer.classList.add('fade-in');
    document.getElementById('memory-difficulty-selector').classList.remove('hidden');
    document.getElementById('memory-stats').classList.remove('hidden');
    updateGameBoard();
}

window.startMemoryGame = startMemoryGame;   // Rend la fonction visible depuis mon html, malgré mon type="module" dans memory.js (bug fix car la fonction startMemoryGame n'était plus accessible, il fallait les attacher à un window)


async function updateGameBoard() {
    playSound('countdown');  // son chaque seconde
    if (countdownInterval) clearInterval(countdownInterval);        // Nettoyage des anciens intervalles
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
    const gameContainer = document.getElementById('memory-game');
        // API pour centrer le plateau de jeu
        gameContainer.scrollIntoView({
            behavior: 'smooth',   // défilement animé
            block:    'center',   // centre verticalement
            inline:   'nearest'   // pas de décalage horizontal
        });
    

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

    // Gère le clic d'une carte
function handleCardClick(card, numPairs) {
    // Empêche clics si plateau verrouillé ou carte déjà trouvée
    if (lockBoard || card.dataset.flipped === "true") return;
    // Empêche de cliquer deux fois sur la même carte pour la compter comme paire
    if (firstCard && card === firstCard) return;

    // Démarre le chronomètre au premier clic
    if (!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(() => {
            timer++;
            document.getElementById('memory-timer').textContent = timer;
        }, 1000);
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

        // Vérifie si les deux cartes forment une paire
        if (firstCard.dataset.image === secondCard.dataset.image) {
            firstCard.dataset.flipped = secondCard.dataset.flipped = "true";
            firstCard.classList.add('found');
            secondCard.classList.add('found');
            matchedPairs++;
            playSound('match');
            resetTurn();

            // Si toutes les paires sont trouvées → victoire
            if (matchedPairs === numPairs) {
                clearInterval(timerInterval);
                playSound('win');

                const difficulty = document.getElementById('difficulty').value;
                console.log("Difficulté choisie :", difficulty); // Devrait afficher par exemple "4x4"
                showModal(`🎉 <strong>Congratulations!</strong><br>⏱️ Temps : ${timer}s • 🎯 Coups : ${moveCount}`);
                setTimeout(() => {
                    demanderPseudo(pseudo => {
                        enregistrerScore(pseudo, moveCount, timer, difficulty);
                    });
                }, 1600);

                document.getElementById("difficulty-selector").addEventListener("change", (e) => {
                const selectedDifficulty = e.target.value;
                afficherClassementPour(selectedDifficulty);
                });
            }
        } else {
            // Pas une paire → retourne les cartes au bout d'un délai
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
    }, 30000);

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





// FIREBASE LEADERBOARD

// Commande pour retirer son pseudo enregistré : localStorage.removeItem("pseudoMemoryGame") (à executer dans la console du navigateur, et doit retourner "undefined")

import { collection, getDocs, query, where, orderBy, limit, serverTimestamp, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

async function enregistrerScore(pseudo, moves, time, difficulty) {
    console.log("Fonction enregistrerScore appelée avec :", pseudo, moves, time, difficulty);
    try {
        // On commence par "normaliser" le pseudo : on enlève les espaces inutiles et on le met en minuscules
        const normalizedPseudo = pseudo.trim().toLowerCase();

        // On cible la collection "classement" dans la base Firestore
        const classementRef = collection(db, "classement");

        // On prépare une requête (query) qui cherche un score EXISTANT pour ce joueur (pseudo normalisé) ET cette difficulté
        const q = query(classementRef,
        where("pseudoNormalized", "==", normalizedPseudo),
        where("difficulty", "==", difficulty)
        );

        // On exécute la requête pour voir si un score existe déjà
        const snapshot = await getDocs(q);

        // Si un score a déjà été enregistré pour ce pseudo et cette difficulté :
        if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];       // On récupère le premier document (normalement unique)
        const oldData = docSnap.data();         // On récupère les anciennes données

        // On vérifie si l'ancien score est meilleur que le nouveau
        const ancienScoreMeilleur =
            oldData.moves < moves ||                           // Moins de coups = meilleur
            (oldData.moves === moves && oldData.time <= time); // Ou même nombre de coups mais temps plus court

        if (ancienScoreMeilleur) {
            console.log("Score existant meilleur, pas de remplacement.");
            return; // On arrête ici, pas de mise à jour nécessaire
        }

        // Sinon (le nouveau score est meilleur), on met à jour le document existant
        await updateDoc(docSnap.ref, {
            pseudo: pseudo,                             // Nom affiché
            pseudoNormalized: normalizedPseudo,         // Nom simplifié pour les comparaisons
            moves,                                      // Nombre de coups
            time,                                       // Temps réalisé
            difficulty,                                 // Niveau joué
            date: serverTimestamp()                     // Date/heure du serveur Firebase
        });

        console.log("Score mis à jour avec succès !");
        } else {
        // Si aucun score n'existait encore pour ce pseudo et cette difficulté, on crée un nouveau document
        await addDoc(classementRef, {
            pseudo,
            pseudoNormalized: normalizedPseudo,
            moves,
            time,
            difficulty,
            date: serverTimestamp()
        });

        console.log("Nouveau score enregistré !");
        }
    } catch (e) {
        console.error("Erreur lors de l'enregistrement du score :", e);
    }
}



function demanderPseudo(callback) {
    // Vérifie si un pseudo est déjà stocké localement dans le navigateur
    const pseudoEnregistre = localStorage.getItem("pseudo");

    // Si on a déjà un pseudo : on le réutilise directement (pas besoin de redemander)
    if (pseudoEnregistre) {
        console.log("Pseudo récupéré depuis le stockage local :", pseudoEnregistre);
        callback(pseudoEnregistre);
        return;
    }

    // Sinon, on crée la boîte de saisie du pseudo
    const overlay = document.createElement("div");
    overlay.classList.add("pseudo-overlay");

    overlay.innerHTML = `
        <div class="pseudo-box">
        <label for="pseudo-input">Entrez votre pseudo :</label>
        <input id="pseudo-input" type="text" maxlength="17" placeholder="Ici..." />
        <div class="pseudo-buttons">
            <button id="pseudo-valider">Valider</button>
            <button id="pseudo-annuler">Annuler</button>
        </div>
        </div>
    `;

    document.body.appendChild(overlay);
    const input = document.getElementById("pseudo-input");
    const validerButton = document.getElementById("pseudo-valider");
    const annulerButton = document.getElementById("pseudo-annuler");

    // Fonction appelée quand l’utilisateur clique sur “Valider”
    function valider() {
        const pseudo = input.value.trim().slice(0, 17);  // Récupération du pseudo, retire espaces inutiles, limitation à 17 caractères (même si l'input a déjà maxlength=17, c’est une sécurité)

        // Si l'utilisateur n'a rien saisi
        if (!pseudo) {
            const box = document.querySelector(".pseudo-box");
            box.classList.add("shake-error");  // Ajout d'une classe déclenchant une animation rouge

            // On retire la classe qui fait bouger et rougir la box
            setTimeout(() => {
                box.classList.remove("shake-error");
            }, 400);

            return;
        }

        // On enregistre ce pseudo localement pour les prochaines fois
        localStorage.setItem("pseudo", pseudo);  // Le pseudo est sauvegardé dans le navigateur (stockage local)

        overlay.remove();  // Si le pseudo est valide : on enlève la boîte de saisie de la page
        callback(pseudo);  // On appelle la fonction callback (fournie plus tôt) avec le pseudo saisi. (cela va déclencher l’enregistrement du score, etc.)
    }

    // Clique sur le bouton "Valider"
    validerButton.addEventListener("click", valider);

    // Clique sur le bouton "Annuler"
    annulerButton.addEventListener("click", () => {
        overlay.remove();  // Ferme la boîte de saisie sans enregistrer
        console.log("Le joueur a choisi de ne pas enregistrer son score.");
    });

    // Appui sur "Entrée" dans le champ
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            valider();
        }
    });

    input.focus(); // Pour que l'utilisateur puisse écrire immédiatement
}



async function afficherClassementPour(difficulty) {
    const pseudoEnregistre = localStorage.getItem("pseudo");
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = ""; // Réinitialise le tableau

    try {
        const classementRef = collection(db, "classement");
        const classementQuery = query(
            classementRef,
            where("difficulty", "==", difficulty),  // Filtre par difficulté
            orderBy("moves", "asc"),    // asc = ascending (ordre croissant)
            orderBy("time", "asc"),
            limit(10)
        );

        const snapshot = await getDocs(classementQuery);

        if (snapshot.empty) {
            leaderboardList.innerHTML = `<tr><td colspan="5">Aucun score pour ${difficulty}</td></tr>`;
            return;
        }

        let index = 1; // Commence à 1 pour le classement

        snapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.date?.toDate();
            const dateStr = date
                ? `${date.toLocaleDateString("fr-FR")}, ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                : "Date inconnue";

            const tr = document.createElement("tr");
                // Vérifie si c'est le pseudo courant → ajoute une classe spéciale
            if (data.pseudo === pseudoEnregistre) {
                tr.classList.add("highlighted-score");
            }

            tr.innerHTML = `
                <td>${index}</td>
                <td>${data.pseudo}</td>
                <td>${data.moves}</td>
                <td>${data.time}s</td>
                <td>${dateStr}</td>
            `;
            leaderboardList.appendChild(tr);
            index++; // Incrémenter à chaque joueur
        });

    } catch (error) {
        console.error("Erreur affichage classement :", error);
        leaderboardList.innerHTML = `<tr><td colspan="5">Erreur de chargement</td></tr>`;
    }
}


// Rajouter un système où le rang du joueur, s'il n'est pas dans le top 10 qui est affiché, est affiché en bas du classement quand même.

/*
Depuis que j'ai ajouté le classement firestore et que j'ai écrit un peu de nouveau code pour ce classement, quand j'appuie dans mon jeu de memory pour changer le niveau de difficulté, ça ne redémarre pas directement un nouveau jeu de memory et il faut après avoir changé le niveau de difficulté appuyé sur le bouton :
<div class="game-button">
    <img src="../RESSOURCES/icons/eyes-memory.jpg" alt="Image du jeu Memory" />
    <button onclick="startMemoryGame()"> Memory </button>
</div>
pour lancer le jeu à nouveau
Bref ça ne fonctionne plus comme avant
Dans ce sélécteur de difficulté :
<div id="memory-difficulty-selector" class="hidden">
    <label for="difficulty">Niveau de difficulté : </label>
    <select id="difficulty" onchange="updateGameBoard()">
        <option value="4x4">🌱 Très facile (8 paires, 4x4)</option> <!-- 8 paires -->
        <option value="5x6">🪴 Facile (15 paires, 5x6)</option> <!-- 15 paires -->
        <option value="6x7">🌳 Moyen (21 paires, 6x7)</option>  <!-- 18 paires -->
        <option value="8x8">👨‍🌾 Difficile (32 paires, 8x8)</option>  <!-- 32 paires -->
    </select>
</div>
*/

// Faire le formulaire Google Sheets pour rentrer les nouveaux webtoons sur le site (avec Blackbox AI directement intégré à VSCode)

// S'occuper du responsive (aspect mobile dégeulasse) (avec Blackbox AI directement intégré à VSCode)

// Faire le Guess the Webtooon (avec Blackbox AI directement intégré à VSCode)

/* (Intéressant pour mon site)
Firebase AI Logic : Construire des fonctionnalités d'IA intelligentes :
- Génération de contenu : Votre application pourrait générer automatiquement des descriptions de produits, des légendes pour des photos, des résumés d'articles, ou même des histoires créatives.
- Chatbots et assistants virtuels : Créez des interfaces de conversation intelligentes qui peuvent interagir avec les utilisateurs, répondre à des questions ou les guider.
- Traitement du langage naturel (TLN) : Analysez et comprenez le texte des utilisateurs pour des expériences plus personnalisées, comme résumer des notes ou traduire du contenu.
- Expériences créatives : Imaginez des jeux où l'IA génère des quêtes ou des dialogues uniques, ou des outils qui aident les utilisateurs à brainstormer des idées.
/*




  
  



/*
    5. Tâches :
    
    Système de classement entre les joueurs :
    - A la fin de la partie, demander le nom du joueur s'il ne l'a pas déjà rentré auparavant
    - Classement en ligne (via une base de données + back-end léger), prend en compte le pseudo du joueur, le niveau de difficulté, le nombre de coups / le temps, la date
    - Envoyer les infos à cette API, puis les récup
    - Demander à Chatgpt des conseils pour améliorer ce classement
    - Sûrement avec Firebase (simple et rapide)

    Animations au retournement de la carte.

    Code responsive (adapté à d'autres tailles d'écran)

    Jeu à 2 joueurs
*/