document.addEventListener('DOMContentLoaded', () => {
    generateGame();
    // Best record loader
    loadRecord();
});

// Variables  setup
// let items = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍋", "🍊", "🍓", "🍍", "🥝"];
// let items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
let items = ["🦙", "🐈‍⬛", "🐍", "🦨", "🦅", "🦉", "🦩", "🦜", "🐌", "🐜"];
let isGameActive = true;
let timer = null;
let gameStarted = false;
let flips = 0;
let misses = 0;
let firstCard = null;
let secondCard = null;
let cards = [];
let flippedCards = [];
let timerStop = 90;
// let matches = 0;

// DOM elements
const gameBoard = document.getElementById('game-board');
const flipsDisplay = document.getElementById('flips');
const timerDisplay = document.getElementById('timer');
const missesDisplay = document.getElementById('misses');
const bestRecordDisplay = document.getElementById('best-record');
const restartBtn = document.getElementById('restart-btn');
const popup = document.getElementById('game-popup');
const popupTitle = document.getElementById('popup-title');
const popupMessage = document.getElementById('popup-message');
const popupButton = document.getElementById('popup-button');

// Event listeners
restartBtn?.addEventListener('click', restartGame);
popupButton?.addEventListener('click', restartGame);

function duplicate() {
    const newArr = [];
    for (let i = 0; i <= items.length - 1; i++) {
        newArr.push(items[i], items[i]);
    }
    return newArr;
}

// board generator
function generateGame() {
    const itemPairs = duplicate(items);

    // Fisher–Yates shuffle algorithm 
    function randomise(itemPairs) {
        for (let i = 0; i < itemPairs.length - 1; i++) {
            const j = i + Math.floor(Math.random() * (itemPairs.length - i));
            [itemPairs[i], itemPairs[j]] = [itemPairs[j], itemPairs[i]]; //swapping
        }
        return itemPairs;
    }

    let prepedItems = randomise(itemPairs);
    // Card reset and restart
    cards = [];

    for (let i = 0; i < prepedItems.length; i++) {
        cards.push({
            item: prepedItems[i],
            match: false,
            flipped: false,
        });
    }

    // board
    gameBoard.innerHTML = '';
    for (let i = 0; i < cards.length; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = i;

        // card content
        const insideCard = document.createElement('div');
        insideCard.className = 'inside-card';

        // front of the card
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = '?';

        // back of the card
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = cards[i].item;

        // adds cardFront and cardBack to insideCard
        insideCard.appendChild(cardFront);
        insideCard.appendChild(cardBack);
        card.appendChild(insideCard);

        card?.addEventListener('click', () => handleCardClick(i));
        // adds card to gameBoard to it can be displayed in html
        gameBoard.appendChild(card);
    }
    console.log(cards)

    updateInfoDisplays();
}

function handleCardClick(i) {
    const cardSelect = cards[i];
    const card = gameBoard.querySelector(`[data-index="${i}"]`).querySelector('.inside-card');

    if (!isGameActive || cardSelect.flipped || cardSelect.match || flippedCards.length >= 2) {
        return;
    }

    if (!gameStarted) {
        startGame();
    }

    cardSelect.flipped = true;
    card.classList.add('flipped');
    flippedCards.push({ index: i, cardSelect });

    if (flippedCards.length === 2) {
        flips++;
        flipsDisplay.textContent = flips;
        checkMatch();
    }
    console.log(flippedCards)
}

function checkMatch() {
    const firstCard = flippedCards[0];
    const secondCard = flippedCards[1];
    const match = firstCard.cardSelect.item === secondCard.cardSelect.item;

    // Element index variables
    const firstElem = gameBoard.querySelector(`[data-index="${firstCard.index}"]`);
    const secondElem = gameBoard.querySelector(`[data-index="${secondCard.index}"]`);

    if (match) {
        handleMatch(firstCard, secondCard, firstElem, secondElem);
    } else {
        handleMismatch(firstCard, secondCard, firstElem, secondElem);
    }
}

function handleMatch(firstCard, secondCard, firstElem, secondElem) {
    cards[firstCard.index].match = true;
    cards[secondCard.index].match = true;

    firstElem.classList.add('matched');
    secondElem.classList.add('matched');

    flippedCards = [];

    // Checks whether all element [i].match is set to true to popup You won! message
    let allMatched = true;
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].match === false) {
            allMatched = false;
            break;
        }
    }
    if (allMatched) {
        handleWin();
    }
}

function handleMismatch(firstCard, secondCard, firstElem, secondElem) {
    misses++; // Missses counter
    missesDisplay.textContent = misses;

    setTimeout(() => {
        firstElem.classList.add('wrong');
        secondElem.classList.add('wrong');

        setTimeout(() => {
            firstElem.classList.remove('wrong');
            secondElem.classList.remove('wrong');
            firstElem.querySelector('.inside-card').classList.remove('flipped');
            secondElem.querySelector('.inside-card').classList.remove('flipped');

            cards[firstCard.index].flipped = false;
            cards[secondCard.index].flipped = false;
            flippedCards = [];
        }, 500);
    }, 500);
}

function startGame() {
    gameStarted = true;
    isGameActive = true;
    startTimer();
}

// Time counter
function startTimer() {
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
        timerStop--;
        timerDisplay.textContent = timerStop;

        if (timerStop <= 0) {
            handleLoss();
        }
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

// Win popup
function handleWin() {
    isGameActive = false;
    stopTimer();
    const timeTaken = 90 - timerStop;
    updateRecord(timeTaken, flips);

    showPopup(
        '🎉 You Won! 🎉',
        `Total Flips: ${flips}\nTotal Misses: ${misses}\nTime Taken: ${timeTaken}s`,
        'Play Again'
    );
}

// Lost popup
function handleLoss() {
    isGameActive = false;
    stopTimer();
    showPopup(
        '⏰ Time\'s Up!',
        'You took too long.',
        'Try Again'
    );
}

//Pop up push of lost and win
function showPopup(title, message, buttonText) {
    if (popup) {
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        popupButton.textContent = buttonText;
        popup.classList.add('show');
    }
}

function loadRecord() {
    if (bestRecordDisplay) {
        const bestTime = localStorage.getItem('bestTime') || '--';
        const bestFlips = localStorage.getItem('bestFlips') || '--';
        bestRecordDisplay.textContent = `${bestTime}s / ${bestFlips} flips`;
    }
}

// Best record with localstorage
function updateRecord(time, flips) {
    if (bestRecordDisplay) {
        const currentBestTime = localStorage.getItem('bestTime');
        const currentBestFlips = localStorage.getItem('bestFlips');

        console.log('New Score:', { time, flips });
        console.log('Current Best:', {
            currentBestTime,
            currentBestFlips
        });

        if (!currentBestTime || !currentBestFlips) {
            console.log('No previous record');
            localStorage.setItem('bestTime', time);
            localStorage.setItem('bestFlips', flips);
            bestRecordDisplay.textContent = `${time}s / ${flips} flips`;
            return;
        }

        // Best record calculation
        const totalScore = time + flips;
        const previousBestTotal = parseInt(currentBestTime) + parseInt(currentBestFlips);

        console.log('Comparison:', {
            totalScore,
            previousBestTotal,
            isNewBest: totalScore < previousBestTotal
        });

        if (totalScore <= previousBestTotal) {
            console.log('Updating new record');
            localStorage.setItem('bestTime', time);
            localStorage.setItem('bestFlips', flips);
            bestRecordDisplay.textContent = `${time}s / ${flips} flips`;
        } else {
            console.log('No new record');
        }
    }
}

function updateInfoDisplays() {
    if (timerDisplay) timerDisplay.textContent = timerStop;
    if (flipsDisplay) flipsDisplay.textContent = flips;
    if (missesDisplay) missesDisplay.textContent = misses;
}

function restartGame() {
    stopTimer();
    if (popup) popup.classList.remove('show');
    isGameActive = true;
    gameStarted = false;
    flips = 0;
    misses = 0;
    firstCard = null;
    secondCard = null;
    cards = [];
    flippedCards = [];
    timerStop = 90;
    generateGame();
}