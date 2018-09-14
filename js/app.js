
const baseDecks = [
    {
        deckName: 'People & Creatures',
        cards :
            [
                'fa-user-astronaut',
                'fa-user-secret',
                'fa-user-ninja',
                'fa-user-md',
                'fa-brain',
                'fa-bug',
                'fa-eye',
                'fa-pastafarianism',
            ]
    },
    {
        deckName: 'Vehicles',
        cards :
            [
                'fa-space-shuttle',
                'fa-fighter-jet',
                'fa-rocket',
                'fa-plane',
                'fa-helicopter',
                'fa-motorcycle',
                'fa-truck-monster',
                'fa-ship',
            ]
    },
    {
        deckName: 'Emoji',
        cards :
            [
                'fa-smile-wink',
                'fa-angry',
                'fa-flushed',
                'fa-grin-squint-tears',
                'fa-grin-tongue-wink',
                'fa-grin-hearts',
                'fa-grin-alt',
                'fa-sad-tear',
            ]
    },
];

let timer = 0;
let elapsedTime = 0;
let moves = 0;
let stars = 3;
let gameDeck = [];
let baseDeckInUse = 0;
let pairsInDeck = 0;
let pairsFound = 0;
let previousGuess = undefined;

function buildDeck(argCards) {
    let deck = argCards;
    pairsInDeck = deck.length;
    deck = deck.concat(argCards);
    return deck;
}

function changeDeck(event) {
    let element = event.target;

    if (!element.classList.contains('button-pressed')) {
        let deckButtons = document.querySelectorAll('.button-group');
        for (let i = 0; i < deckButtons.length; i++) {
            if (deckButtons[i].id === element.id) {
                baseDeckInUse = i;
            } else {
                deckButtons[i].classList.remove('button-pressed');
            }
        }
        element.classList.add('button-pressed');
        gameDeck = buildDeck(baseDecks[baseDeckInUse].cards);
        resetGame();
    }
}

// Fisher-Yates (aka Knuth) Shuffle function from Stack Overflow https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/2450976#2450976
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
  }

function removeCards() {
    let cardElements = document.querySelectorAll('.card');

    for (let cardElement of cardElements) {
        cardElement.remove();
    }
}

function dealCards(argCards) {
    let gameBoard = document.querySelector('.game-board');
    let newCardLi;
    let newCardSpan;

    for (let card of argCards) {
        newCardLi = document.createElement('li');
        newCardLi.classList.add('container');
        newCardLi.classList.add('card');
        newCardLi.classList.add('face-down');
        newCardLi.classList.add('clickable-card');

        newCardSpan = document.createElement('span');
        newCardSpan.classList.add('fas');
        newCardSpan.classList.add(card);

        newCardLi.appendChild(newCardSpan);
        newCardLi.addEventListener('click', guessCard);

        gameBoard.appendChild(newCardLi);
    }
}

function guessCard(event) {
    let element = event.target;
    if (element.nodeName !== 'LI') {
        element = element.parentElement;
    }

    // Card must be face down to process guess
    if (element.classList.contains('clickable-card')) {
        element.classList.toggle('clickable-card');
        element.classList.toggle('guess');

        if (previousGuess === undefined) {
            // First card has been guessed. Save for later comparison to second card
            console.log('First Guess: ' + element.firstElementChild.className);
            previousGuess = element;
        } else {
            // Second Card has been guessed. Increment move counter and calculate stars
            console.log('Second Guess: ' + element.firstElementChild.className);
            moves++;
            document.querySelector('#move-counter').textContent = moves;

            switch (stars) {
                case 3:
                    if (moves > 16) {
                        stars--;
                        document.querySelector('#star3').classList.replace('bright-star', 'dim-star');
                    }
                    break;
                case 2:
                    if (moves > 20) {
                        stars--;
                        document.querySelector('#star2').classList.replace('bright-star', 'dim-star');
                    }
                    break;
                // Project Rubic Calls for allowing for at least one star
                // case 1:
                //     if (moves > 24) {
                //         stars--;
                //         document.querySelector('#star1').classList.replace('bright-star', 'dim-star');
                //     }
                //     break;
            }

            // Compare cards to determine if they match
            if (previousGuess.firstElementChild.className === element.firstElementChild.className) {
                console.log('Match!');
                turnCardFaceUp(previousGuess);
                turnCardFaceUp(element);
                pairsFound++;
                if (pairsFound === pairsInDeck) {
                    finishGame();
                }
            } else {
                console.log('NO Match');
                turnCardFaceDown(previousGuess);
                turnCardFaceDown(element);
            }
            previousGuess = undefined;
        }
    }
}

function turnCardFaceUp(element) {
    setTimeout(function(element){
        element.classList.toggle('face-up');
        element.classList.toggle('guess');
    }, 500, element);
}

function turnCardFaceDown(element) {
    element.classList.toggle('incorrect-guess');
    setTimeout(function(element){
        element.classList.toggle('incorrect-guess');
        element.classList.toggle('guess');
        element.classList.toggle('clickable-card');
    }, 500, element);
}

function showAllCards() {
    let cardElements = document.querySelectorAll('.card');

    for (let cardElement of cardElements) {
        cardElement.classList.replace('face-down', 'face-up');
    }
}

function displayTimer() {
    elapsedTime = elapsedTime + 1;

    // let days = Math.floor(elapsedTime / (3600 * 24));
    let hours = Math.floor((elapsedTime % (3600 * 24)) / 3600);
    let minutes = Math.floor((elapsedTime % 3600) / 60);
    let seconds = Math.floor(elapsedTime % 60);
    document.querySelector('#timer').textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function resetGame() {
    document.querySelector('.modal').classList.remove('show-modal');

    gameDeck = shuffle(gameDeck);

    removeCards();
    dealCards(gameDeck);

    // Start Timer
    clearInterval(timer);
    elapsedTime = 0;
    document.querySelector('#timer').textContent = '0:00:00';
    timer = setInterval(displayTimer, 1000);

    // Reset Moves
    moves = 0;
    document.querySelector('#move-counter').textContent = moves;
    previousGuess = undefined;
    pairsFound = 0;

    // Reset Stars
    stars = 3;
    for (let i = 1; i < 4; i++) {
        document.querySelector('#star' + i).classList.replace('dim-star', 'bright-star');
    }
}

function finishGame() {
    console.log('Congratulations! You Won!');
    clearInterval(timer);

    for (let i = 1; i < 4; i++) {
        document.querySelector('#results-star' + i).className = document.querySelector('#star' + i).className;
    }

    document.querySelector('#results-timer').textContent = document.querySelector('#timer').textContent;
    document.querySelector('#results-move-counter').textContent = moves;

    setTimeout(function(){
        document.querySelector('.modal').classList.toggle('show-modal');
    }, 500);
}

// Initial Game Setup
document.querySelector('#restart').addEventListener('click', resetGame);
document.querySelector('#play-again').addEventListener('click', resetGame);

document.querySelector('#deck1').addEventListener('click', changeDeck);
document.querySelector('#deck2').addEventListener('click', changeDeck);
document.querySelector('#deck3').addEventListener('click', changeDeck);

gameDeck = buildDeck(baseDecks[baseDeckInUse].cards);
resetGame();