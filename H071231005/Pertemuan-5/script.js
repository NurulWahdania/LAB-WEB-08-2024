let playerMoney = 5000;
let bet = 100;  
let deck = [];
let playerHand = [];
let dealerHand = [];

const suits = ['C', 'D', 'H', 'S'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; 
    }
}

function resetCardsAndScores() {
    document.getElementById('player-cards').innerHTML = ''; 
    document.getElementById('dealer-cards').innerHTML = ''; 
    document.getElementById('player-score').innerText = ''; 
    document.getElementById('dealer-score').innerText = ''; 
}

function displayCards(hand, elementId, hideSecondCard = false) {
    const handContainer = document.getElementById(elementId);
    handContainer.innerHTML = '';

    hand.forEach((card, index) => {
        const cardImage = document.createElement('img');
        if (hideSecondCard && index === 1) {
            cardImage.src = 'cards/yo.png'; 
            cardImage.classList.add('card-slide-in'); 
        } else {
            cardImage.src = `cards/${card.value}-${card.suit}.png`;
        }

        cardImage.alt = `${card.value} of ${card.suit}`;
        cardImage.style.width = '100px';  
        cardImage.classList.add('new-card');
        handContainer.appendChild(cardImage);
    });
}

function updateBet(betAmount) {
    bet += betAmount;  
    document.getElementById('bet-display').innerText = `Bet: $${bet}`;
}

function reduceBet(betAmount) {
    if (bet - betAmount >= 100) {  
        bet -= betAmount;
        document.getElementById('bet-display').innerText = `Bet: $${bet}`;
    }
}

function calculateScore(hand) {
    let score = 0;
    let aceCount = 0;

    hand.forEach(card => {
        if (card.value === 'A') {
            score += 11;
            aceCount++;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    });

    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }

    return score;
}

function updateScores() {
    const playerScore = calculateScore(playerHand);
    document.getElementById('player-score').innerText = `Player Score: ${playerScore}`;

    if (dealerHand.length > 0) {
        const dealerVisibleScore = calculateScore([dealerHand[0]]);
        const dealerHiddenScore = '?';
        const dealerScoreText = `Dealer Score: ${dealerVisibleScore} + ${dealerHiddenScore}`;
        document.getElementById('dealer-score').innerText = dealerScoreText;
    }
}

function displayNewCards(hand, elementId) {
    const handContainer = document.getElementById(elementId);
    const existingCards = handContainer.childElementCount;
    for (let i = existingCards; i < hand.length; i++) {
        const card = hand[i];
        const cardImage = document.createElement('img');
        cardImage.src = `cards/${card.value}-${card.suit}.png`;
        cardImage.alt = `${card.value} of ${card.suit}`;
        cardImage.style.width = '100px';
        cardImage.classList.add('new-card');
        handContainer.appendChild(cardImage);
    }
}

function hit() {
    if (deck.length > 0) {
        const newCard = deck.pop();  
        playerHand.push(newCard);   

        displayNewCards(playerHand, 'player-cards');
        const playerScore = calculateScore(playerHand);
        updateScores(); 

        if (playerScore > 21) {
            const finalDealerScore = calculateScore(dealerHand);
            document.getElementById('dealer-score').innerText = `Dealer Score: ${finalDealerScore}`;
            endGame('Player busts! Dealer wins.'); 
        }
    } else {
        alert("No cards left in the deck.");
    }
}

function stay() {
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stay-button').disabled = true;
    displayCards(dealerHand, 'dealer-cards', false);  

    let dealerScore = calculateScore(dealerHand);
    while (dealerScore < 17 && deck.length > 0) {
        dealerHand.push(deck.pop());
        dealerScore = calculateScore(dealerHand);
        displayNewCards(dealerHand, 'dealer-cards');
    }

    updateScores();  
    determineWinner(); 
}

document.getElementById('deal-button').addEventListener('click', () => {
    if (bet > playerMoney) {
        alert('Your bet exceeds your available money!');
        return;
    }
    
    createDeck();
    shuffleDeck();
    resetCardsAndScores();  

    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];

    displayCards(playerHand, 'player-cards');
    displayCards(dealerHand, 'dealer-cards', true);  

    updateScores();

    document.getElementById('hit-button').disabled = false;
    document.getElementById('stay-button').disabled = false;
    document.getElementById('result').innerText = '';
});

function determineWinner() {
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    if (dealerScore > 21) {
        endGame('Dealer busts! Player wins.');
    } else if (playerScore > dealerScore) {
        endGame('Player wins!');
    } else if (playerScore < dealerScore) {
        endGame('Dealer wins.');
    } else {
        endGame('It\'s a draw.');
    }
}

function endGame(result) {
    document.getElementById('result').innerText = result;

    displayCards(dealerHand, 'dealer-cards', false);  

    const finalDealerScore = calculateScore(dealerHand);
    document.getElementById('dealer-score').innerText = `Dealer Score: ${finalDealerScore}`;

    if (result.includes('Player wins')) {
        playerMoney += bet * 2; 
    } else {
        playerMoney -= bet;
    }

    document.getElementById('money-display').innerText = `Money: $${playerMoney}`;

    if (playerMoney <= 0) {
        alert("Game over! You're out of money.");
        resetGame();
    }

    document.getElementById('hit-button').disabled = true;
    document.getElementById('stay-button').disabled = true;
}

function resetGame() {
    playerMoney = 5000;
    bet = 100; 
    document.getElementById('money-display').innerText = `Money: $${playerMoney}`;
    document.getElementById('bet-display').innerText = `Bet: $100`; 
    resetCardsAndScores();  
}

document.querySelectorAll('.bet-image').forEach(img => {
    img.addEventListener('click', (e) => {
        const betAmount = parseInt(e.target.getAttribute('data-bet'));
        updateBet(betAmount);
    });
});

document.querySelectorAll('.reduce-bet-image').forEach(img => {
    img.addEventListener('click', (e) => {
        const betAmount = parseInt(e.target.getAttribute('data-bet'));
        reduceBet(betAmount);
    });
});

document.getElementById('deal-button').addEventListener('click', () => {
    if (bet > playerMoney) {
        alert('Your bet exceeds your available money!');
        return;
    }
    
    createDeck();
    shuffleDeck();
    resetCardsAndScores();  

    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];

    displayCards(playerHand, 'player-cards');
    displayCards(dealerHand, 'dealer-cards', true);  

    updateScores();

    document.getElementById('hit-button').disabled = false;
    document.getElementById('stay-button').disabled = false;
});

document.getElementById('hit-button').addEventListener('click', hit);
document.getElementById('stay-button').addEventListener('click', stay);