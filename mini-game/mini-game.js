
//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//character
let characterWidth = 34; //width/height ratio = 408/228 = 17/12
let characterHeight = 24;
let characterX = boardWidth/8;
let characterY = boardHeight/2;
let characterImg;

let character = {
    x : characterX,
    y : characterY,
    width : characterWidth,
    height : characterHeight
}

//pipes
let hurdleArray = [];
let hurdleWidth = 64; //width/height ratio = 384/3072 = 1/8
let hurdleHeight = 512;
let hurdleX = boardWidth;
let hurdleY = 0;

let topHurdleImg;
let bottomHurdleImg;

//physics
let velocityX = -2; //hurdles moving left speed
let velocityY = 0; //character jump speed
let gravity = 0.1 ;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy character
    // context.fillStyle = "green";
    // context.fillRect(character.x, character.y, character.width, character.height);

    //load images
    characterImg = new Image();
    characterImg.src = "/mini-game/static/character.png";
    characterImg.onload = function() {
        context.drawImage(characterImg, character.x, character.y, character.width, character.height);
    }

    topHurdleImg = new Image();
    topHurdleImg.src = "/mini-game/static/topHurdle.png";

    bottomHurdleImg = new Image();
    bottomHurdleImg.src = "/mini-game/static/bottomHurdle.png";
    requestAnimationFrame(update);
    setInterval(placeHurdles, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveCharacter);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        window.location.href = 'gameover.html';
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //character
    velocityY += gravity;
    // character.y += velocityY;
    character.y = Math.max(character.y + velocityY, 0); //apply gravity to current character.y, limit the character.y to top of the canvas
    context.drawImage(characterImg, character.x, character.y, character.width, character.height);

    if (character.y > board.height) {
        gameOver = true;
    }

    //hurdles
    for (let i = 0; i < hurdleArray.length; i++) {
        let hurdle = hurdleArray[i];
        hurdle.x += velocityX;
        context.drawImage(hurdle.img, hurdle.x, hurdle.y, hurdle.width, hurdle.height);
        if (!hurdle.passed && character.x > hurdle.x + hurdle.width) {
            score += 0.5; //0.5 because there are 2 hurdles! so 0.5*2 = 1, 1 for each set of hurdles
            hurdle.passed = true;
        }

        if (detectCollision(character, hurdle)) {
            gameOver = true;
        }
    }

    //clear hurdles
    while (hurdleArray.length > 0 && hurdleArray[0].x < -hurdleWidth) {
        hurdleArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placeHurdles() {
    if (gameOver) {
        return;
    }

    //(0-1) * hurdleHeight/2.
    // 0 -> -128 (hurdleHeight/4)
    // 1 -> -128 - 256 (hurdleHeight/4 - hurdleHeight/2) = -3/4 hurdleHeight
    let randomHurdleY = hurdleY - hurdleHeight/4 - Math.random()*(hurdleHeight/2);
    let openingSpace = board.height/4;

    let topHurdle = {
        img : topHurdleImg,
        x : hurdleX,
        y : randomHurdleY,
        width : hurdleWidth,
        height : hurdleHeight,
        passed : false
    }
    hurdleArray.push(topHurdle);

    let bottomHurdle = {
        img : bottomHurdleImg,
        x : hurdleX,
        y : randomHurdleY + hurdleHeight + openingSpace,
        width : hurdleWidth,
        height : hurdleHeight,
        passed : false
    }
    hurdleArray.push(bottomHurdle);
}

function moveCharacter(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            character.y = characterY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}