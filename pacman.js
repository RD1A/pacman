
console.log("pacman is running");

// board
let board;

const rowCount = 21;
const columnCount = 19;
const tileSize = 32;
const boardWidth = columnCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;


// images
let InkyImage;
let ClydeGhostImage;
let PinkyGhostImage;
let BlinkyGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;
let scaredGhostImage;
let pacman;
let cherryImage;
let powerupImage;

const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "XO               OX",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    ",,,X           X",
    "XXXX X XX XX X XXXXXXX",
    "     X ,bpor X      ",
    "XXXX X XXXXX X XXXX",
    ",,,X           X",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X        C        X",
    "X XXXXXX X XXXXXX X",
    "XO               OX",
    "XXXXXXXXXXXXXXXXXXX"
];

// game state
const walls = new Set();
const foods = new Set();
const ghosts = new Set();


const directions = ['U', 'D', 'L', 'R'];

let score = 0;
let lives = 3;
let gameOver = false;
let powerMode = false;
let powerTimer = 0;





function activatePowerMode() {
    powerMode = true;
    powerTimer = 200; // ~10 seconds

    // make ghosts scared
    for (let ghost of ghosts.values()) {
        ghost.image = scaredGhostImage;
    }
}

function deactivatePowerMode() {
    powerMode = false;

    for (let ghost of ghosts.values()){
        ghost.isScared = false;
        ghost.isEaten = false;
        ghost.image = ghost.StartImage;

    }

}






window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;

    context = board.getContext("2d");

    loadImages();
    loadMap();
    update();

    document.addEventListener("keydown", movePacman);
};



function loadImages() {
    //map
    wallImage = new Image();
    wallImage.src = "./images/wall.png";


    //characters
    scaredGhostImage = new Image();
    scaredGhostImage.src = "./images/scaredGhost.png";


    BlinkyImage = new Image();
    BlinkyImage.src = "./images/Blinky.png";

    PinkyImage = new Image();
    PinkyImage.src = "./images/pinky.png";

    ClydeImage = new Image();
    ClydeImage.src = "./images/Clyde.png";

    InkyImage = new Image();
    InkyImage.src = "./images/Inky.png";

    pacmanUpImage = new Image();
    pacmanUpImage.src = "./images/pacmanUp.png";

    pacmanDownImage = new Image();
    pacmanDownImage.src = "./images/pacmanDown.png";

    pacmanLeftImage = new Image();
    pacmanLeftImage.src = "./images/pacmanLeft.png";

    pacmanRightImage = new Image();
    pacmanRightImage.src = "./images/pacmanRight.png";


    //food and powerup 
    cherryImage = new Image();
    cherryImage.src = "./images/cherry.png";

    powerupImage = new Image();
    powerupImage.src = "./images/powerup.png";
}



function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {

            const row = tileMap[r];
            const tileMapChar = row[c];

            const x = c * tileSize;
            const y = r * tileSize;

            if (tileMapChar == 'X') {
                const wall = new Block(wallImage, x, y, tileSize, tileSize);
                walls.add(wall);
            }

            else if (tileMapChar == 'r') {
                const ghost = new Block(BlinkyImage, x, y, tileSize, tileSize);
                ghost.StartImage = BlinkyImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'o') {
                const ghost = new Block(ClydeImage, x, y, tileSize, tileSize);
                ghost.StartImage = ClydeImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'p') {
                const ghost = new Block(PinkyImage, x, y, tileSize, tileSize);
                ghost.StartImage = PinkyImage;
                ghosts.add(ghost);
            }

            else if (tileMapChar == 'S') {
                const ghost = new Block(scaredGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }

            else if (tileMapChar == 'b') {
                const ghost = new Block(InkyImage, x, y, tileSize, tileSize);
                  ghost.StartImage = InkyImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'P') {
                pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
            }

            else if (tileMapChar == 'O') {
                const powerup = new Block(powerupImage, x, y, tileSize, tileSize);
                foods.add(powerup);
            }

            else if (tileMapChar == ' ') {
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);

            }

            else if (tileMapChar == 'C') {
                const cherry = new Block(cherryImage, x, y, tileSize, tileSize);
                foods.add(cherry);
            }
        }
    }
}



function update() {
    if (gameOver) return;

    move();
    draw();

    setTimeout(update, 50);
}



function draw() {
    context.clearRect(0, 0, board.width, board.height);

    if (pacman) {
        context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    }

    for (let ghost of ghosts.values()) {
        if (ghost.image) {
            context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
        }
    }

    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }

    context.fillStyle = "white";

    for (let food of foods.values()) {
        if (food.image) {
            context.drawImage(food.image, food.x, food.y, food.width, food.height);
        } else {
            context.fillRect(food.x, food.y, food.width, food.height);
        }
    }



    // for (let  powerup of powerups.values()) {
    //     if (powerup.image) {
    //         context.drawImage(powerup.image, powerup.x, powerup.y, powerup.width, powerup.height);
    //     } else {
    //         context.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
    //     }
    // }




    //score
    context.fillStyle = "white";
    context.font = "14px sans-serif";
    if (gameOver) {
        context.fillText("Game Over: " + String(score), tileSize / 2, tileSize / 2);
    }
    else {
        context.fillText("x" + String(lives) + " " + String(score), tileSize / 2, tileSize / 2);
    }


}


function move() {

    if (powerMode) {
        powerTimer--;

        if (powerTimer <= 0) {
            deactivatePowerMode();
        }
    }

    if (powerMode) {
        powerTimer--;

        if (powerTimer <= 0) {
            deactivatePowerMode();
        }
    }




    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    for (let wall of walls.values()) {
        if (collision(pacman, wall)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    if (pacman.x < -pacman.width) {
        pacman.x = boardWidth;
    }
    else if (pacman.x > boardWidth) {
        pacman.x = -pacman.width;
    }



for (let ghost of ghosts.values()) {

    if (collision(ghost, pacman)) {

        // 🟦 POWER MODE: Pac-Man eats ghost
        if (powerMode && ghost.isScared) {
            ghost.reset();
            score += 200;
            continue; // skip life loss
        }

        // 🔴 NORMAL MODE: Pac-Man dies
        lives -= 1;

        if (lives == 0) {
            gameOver = true;
            return;
        }

        resetPositions();
    }
}









        if (ghost.y == tileSize * 9 && ghost.direction != 'U' && ghost.direction != 'D') {
            ghost.updateDirection('U');
        }

        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        for (let wall of walls.values()) {
            if (
                collision(ghost, wall) ||
                ghost.x < 0 || ghost.x + ghost.width > boardWidth
            ) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;

let newDirection;

if (powerMode && ghost.isScared) {
    // scared ghosts run randomly but faster panic feel
    newDirection = directions[Math.floor(Math.random() * directions.length)];
} else {
    newDirection = directions[Math.floor(Math.random() * directions.length)];
}

ghost.updateDirection(newDirection);

                if (ghost.x < -ghost.width) {
                    ghost.x = boardWidth;
                }
                else if (ghost.x > boardWidth) {
                    ghost.x = -ghost.width;
                }

            }
        }
    }




    
let foodEaten = null;

for (let food of foods.values()) {
    if (collision(pacman, food)) {

        foodEaten = food;  
        if (food.image && food.image.src.includes("powerup")) {
            activatePowerMode();
        }
       
        else if (food.image && food.image.src.includes("cherry")) {
            score += 100;
        }

        else {
            score += 10;
        }

        break;
    }
}
    //next Level

    if (foods.size == 0) {
        loadMap();
        resetPositions();
    }

    if (foodEaten != null) {
        foods.delete(foodEaten);
    }

    if (foods.size == 0) {
        loadMap();
        resetPositions();
    }




function movePacman(e) {


    if (gameOver) {
        loadMap();
        resetPositions();
        lives = 3;
        gameOver = false;
        update();
        return;

    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)) {
        e.preventDefault();
    }
    if (gameOver) {
        loadMap();
        resetPositions();
        lives = 3;
        score = 0;
        gameOver = false;

        return;
    }

    if (e.code == "ArrowUp" || e.code == "KeyW") {
        pacman.updateDirection('U');
    }
    else if (e.code == "ArrowDown" || e.code == "KeyS") {
        pacman.updateDirection('D');
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        pacman.updateDirection('L');
    }
    else if (e.code == "ArrowRight" || e.code == "KeyD") {
        pacman.updateDirection('R');
    }

    if (pacman.direction == 'U') pacman.image = pacmanUpImage;
    else if (pacman.direction == 'D') pacman.image = pacmanDownImage;
    else if (pacman.direction == 'L') pacman.image = pacmanLeftImage;
    else if (pacman.direction == 'R') pacman.image = pacmanRightImage;
}



function collision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}



function resetPositions() {
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;

    for (let ghost of ghosts.values()) {
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random() * directions.length)];
        ghost.updateDirection(newDirection);
    }
}



class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.startX = x;
        this.startY = y;

        this.direction = 'r';
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updateDirection(direction) {
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();

        this.x += this.velocityX;
        this.y += this.velocityY;

        for (let wall of walls.values()) {
            if (collision(this, wall)) {
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }
    }

    updateVelocity() {
        if (this.direction == 'U') {
            this.velocityX = 0;
            this.velocityY = -tileSize / 4;
        }
        else if (this.direction == 'D') {
            this.velocityX = 0;
            this.velocityY = tileSize / 4;
        }
        else if (this.direction == 'L') {
            this.velocityX = -tileSize / 4;
            this.velocityY = 0;
        }
        else if (this.direction == 'R') {
            this.velocityX = tileSize / 4;
            this.velocityY = 0;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
}