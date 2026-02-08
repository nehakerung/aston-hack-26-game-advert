
//board
let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

//character

let sizeFactor = 0.8;  // Reduce size by 20%

// Update the character dimensions based on the size factor
let characterWidth = boardWidth * 0.1 * sizeFactor; // 80% of the original width
let characterHeight = characterWidth * (12 / 17);  // Maintain aspect ratio
let characterX = boardWidth/8;
let characterY = boardHeight/2;
let characterImg;

let character = {
    x : characterX,
    y : characterY,
    width : characterWidth,
    height : characterHeight
}

//bubbles
let hurdleArray = [];
let hurdleWidth = 300; //width/height ratio = 384/3072 = 1/8
let hurdleHeight = 512;
let hurdleX = boardWidth;
let hurdleY = 0;

let topHurdleImg;
let bottomHurdleImg;

//physics
let velocityX = -3; //hurdles moving left speed
let velocityY = 0; //character jump speed
let gravity = 0.3 ;

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
    characterImg.src = "/mini-game/static/BlueOctopusPic.png";
    characterImg.onload = function() {
        context.drawImage(characterImg, character.x, character.y, character.width, character.height);
    }

    topHurdleImg = new Image();
    topHurdleImg.src = "/mini-game/static/BubbleHurdles.png";

    bottomHurdleImg = new Image();
    bottomHurdleImg.src = "/mini-game/static/BubbleHurdles.png";
    requestAnimationFrame(update);
    setInterval(placeHurdles, 1800); //every 1.8 seconds
    document.addEventListener("keydown", moveCharacter);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        drawGameOver();  // Show the "Game Over" message

        // Redirect to the YouTube ad page after 2-3 seconds
        setTimeout(function() {
            window.location.href = '/ad-video.html';  // Change this to your actual ad video page
        }, 2000); // Wait for 2 seconds before redirecting (you can adjust this delay)
        
        return; // Prevent further updates once the game is over
    }
    context.clearRect(0, 0, board.width, board.height);

    function drawGameOver() {
        context.fillStyle = "rgba(0, 0, 0, 0.7)";  // Semi-transparent background color
        context.fillRect((board.width - context.measureText("GAME OVER").width) / 2 - 10, // Center the box horizontally with some padding
                         board.height / 2 - 40,  // Move the box slightly above the center
                         context.measureText("GAME OVER").width + 20,  // Add padding around the text
                         60);  // Height of the background box
    
        context.fillStyle = "white";  // Set the text color to white
        context.font = "45px sans-serif";  // Set the font size and style
        let textX = (board.width - context.measureText("GAME OVER").width) / 2;  // Calculate centered X position
        let textY = board.height / 2;  // Center vertically
    
        context.fillText("GAME OVER", textX, textY);  // Draw the "Game Over" text
    }
    
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

  /*  if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }*/
}

function placeHurdles() {
    if (gameOver) {
        return;
    }

    //(0-1) * hurdleHeight/2.
    // 0 -> -128 (hurdleHeight/4)
    // 1 -> -128 - 256 (hurdleHeight/4 - hurdleHeight/2) = -3/4 hurdleHeight
    let randomHurdleY = hurdleY - hurdleHeight/4 - Math.random()*(hurdleHeight/2);
    let openingSpace = board.height/4 * 1.5; //Increases the opening gap by 50%

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
        // Jump (apply negative velocity)
        velocityY = -6;

        // Reset game if it's over
        if (gameOver) {
            // Reset character position
            character.y = characterY;

            // Clear the hurdles array
            hurdleArray = [];

            // Reset score and game over state
            score = 0;
            gameOver = false;
        }
    }
}

let collisionHitboxFactor = 0.7;  // Shrink the hitbox by 30%
function detectCollision(a, b) {
    // Calculate the smaller hitbox dimensions using the collisionHitboxFactor
    let hitboxWidth = a.width * collisionHitboxFactor;
    let hitboxHeight = a.height * collisionHitboxFactor;

    return a.x < b.x + b.width &&   // a's top left corner doesn't reach b's top right corner
           a.x + hitboxWidth > b.x &&   // a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  // a's top left corner doesn't reach b's bottom left corner
           a.y + hitboxHeight > b.y;    // a's bottom left corner passes b's top left corner
}
