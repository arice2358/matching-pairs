let firstCard;   // store the first card in the pair, ready to compare.
let ignoreClick = false;    // prevent turning cards in certain board states

let movesCount = 0; // number of moves made

/*
* Initialise the board.
*/
async function initBoard() {
    let isMobileDevice = window.matchMedia("only screen and (max-width:760px)").matches; // if mobile try to make the board dimensions portait where possible
    ignoreClick = true;
    resetMoveCount();

    // remove the attribution link
    let a = document.getElementById("attribution");
    a.href = "";
    a.innerText = "";

    let rows, cols; // board dimesions
    let cards = []; // list of cards on the board
    let deck = []; // cards in the deck for the selected theme
    let boardSizeSelect = document.getElementById("boardSizeSelect");
    let boardSize = boardSizeSelect.options[boardSizeSelect.selectedIndex].text;
    let themeSelect = document.getElementById("themeSelect");
    let theme = themeSelect.options[themeSelect.selectedIndex].text;
    let attribution = null; // attribution details for artwork

    switch (boardSize) {
        case '4':
            rows = 2;
            cols = 2;
            break;
        case '8':
                rows = 2;
                cols = 4;

            break;
        case '12':
                rows = 3;
                cols = 4;

            break;
        case '16':
            rows = 4;
            cols = 4;
            break;
        case '20':
            if (isMobileDevice) {
                rows = 5;
                cols = 4;
            } else {
                rows = 4;
                cols = 5;
            }
            break;
        default:
            rows = 2;
            cols = 2;
    }

    switch (theme) {
        case 'Shapes':
            deck = shapesDeck;
            back = shapesBack;
            break;
        case 'Animals':
            deck = animalsDeck;
            back = animalsBack;
            attribution = animalsAttribution
            break;
        default:
            deck = animalsDeck;
            back = animalsBack;
            break;
    }

    // from the available deck, select cards for this board size
    cards = cards.concat(deck.cards.slice(0, (boardSize / 2)));
    cards = cards.concat(deck.cards.slice(0, (boardSize / 2)));
    cards = shuffle(cards);

    // clear down the board before resetting
    document.getElementById("board").remove();

    // re-create the board
    let board = document.createElement('div');
    board.id = "board";
    document.getElementById("board-container").append(board);
    let id = 0;

    for (row = 0; row < rows; row++) {
        let rowDiv = document.createElement('div');
        rowDiv.className = "row";
        board.append(rowDiv);

        for (col = 0; col < cols; col++) {
            let card = cards[id];
            let cardDiv = document.createElement('div');
            cardDiv.className = "col";

            let cardHtml = `
            <div id="card${id}" class="card">
                    <div class="front">
                        <img class="responsive" onclick="cardClick(this)" src="${back}" />
                    </div>
                    <div class="back">
                        <img class="responsive" onclick="cardClick(this)" src="${card.url}" alt="${card.name}" />
                    </div>
                </div>`;

            cardDiv.innerHTML = cardHtml;
            rowDiv.append(cardDiv);
            id++;
        }
    }

    // set the attribution link
    if(attribution) {
        let a = document.getElementById("attribution");
        a.href = attribution.url;
        a.innerText = attribution.name;
    }

    // need to wait for the fade-in animation to complete otherwise the card flip
    // animation doesn't work properly.
    await new Promise(r => setTimeout(r, 1500));
    ignoreClick = false;
}

/*
* Handle the click event on a card.
*/
function cardClick(cardImg) {
    if (ignoreClick) {
        return;
    }

    let card = cardImg.parentElement.parentElement;
    if (card === firstCard) {
        return;
    }

    if (firstCard) {
        ignoreClick = true;
    }

    // turn it face up
    card.classList.add("card-rotate");

    // check if this is the first or second card being turned
    card.ontransitionend = () => {
        if (firstCard) {
            // this is the second card turned, so check if they match
            updateMoveCount()
            validate(firstCard, card);
            firstCard = null;
        }
        else {
            // this is the first card being turned, so store it
            firstCard = card;
            ignoreClick = false;
        }
    };
}

/*
* Check if we have a matching pair.
*/
function validate(card1, card2) {
    card1Name = card1.lastElementChild.firstElementChild.getAttribute("alt");
    card2Name = card2.lastElementChild.firstElementChild.getAttribute("alt");

    if (card1Name === card2Name) {
        // prevent from being clicked again
        card1.lastElementChild.firstElementChild.onclick = null;
        card2.lastElementChild.firstElementChild.onclick = null;

        // highlight the matching cards
        card1.classList.add("card-match");
        card2.classList.add("card-match");

        ignoreClick = false;
    }
    else {
        // else no match and turn face down.    

        // highlight the mis-matching cards
        card1.classList.add("card-mismatch");
        card2.classList.add("card-mismatch");

        // pause before rotating back
        card1.classList.add("rotate-delay");
        card2.classList.add("rotate-delay");

        // rotate back - face down
        card1.classList.remove("card-rotate");
        card2.classList.remove("card-rotate");

        // prevent player turning more cards while this pair are resetting
        ignoreClick = true;

        card1.ontransitionend = () => {
            card1.classList.remove("card-mismatch");
            card1.classList.remove("rotate-delay");
            ignoreClick = false;
        };

        card2.ontransitionend = () => {
            card2.classList.remove("card-mismatch");
            card2.classList.remove("rotate-delay");
            ignoreClick = false;
        };
    }
}

function updateMoveCount() {
    movesCount++;
    document.getElementById("movesCount").value = movesCount;
}

function resetMoveCount() {
    movesCount = 0;
    document.getElementById("movesCount").value = movesCount;
}

/*
* Shuffle the list of card pairs to randomise the board.
*/
function shuffle(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}