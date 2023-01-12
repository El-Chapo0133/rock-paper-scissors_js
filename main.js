let canvas = document.getElementById("main");
let context = canvas.getContext("2d");

const DEFAULT_MAP_BACKGROUND = "white";
const MAPSIZEX = 1300;
const MAPSIZEY = 900;
const EDGERESTITUTION = 1;
const COLLISIONRESTITUTION = 1;
const NUMBEROFOBJECTS = 200;
const g = 9.81; // this is only for fun lol

const GENERATIONOBJECTMAXSPEED = 100;
const GENERATIONOBJECTMINSPEED = 10;

const GAMEOBJECTRADIUS = 25; // object size, as square this is theirs width and height

// the rate of the display (10 makes it 1:10, X makes it 1:X)
const DISPLAYRATE = 1;

const IMAGEPAPERSRC = ".\\Resources\\paper.png";
const IMAGESCISSORSSRC = ".\\Resources\\scissors.png";
const IMAGEROCKSRC = ".\\Resources\\rock.png";


let paperImage = new Image();
paperImage.src = IMAGEPAPERSRC;
let scissorsImage = new Image();
scissorsImage.src = IMAGESCISSORSSRC;
let rockImage = new Image();
rockImage.src = IMAGEROCKSRC;
let imageCisorsPaperRock = [scissorsImage, paperImage, rockImage];

/* type graph :
    0 is cisor
    1 is paper
    2 is rock
    0 wins to 1
    1 wins to 2
    2 wins to 0
*/
const UNIVERSAL_POWER_GRID = [
    /* xxxxx 0  1  2 */
    /* 0 */ [0, 0, 2],
    /* 1 */ [0, 1, 1],
    /* 2 */ [2, 1, 2],
];
// this is a grid that define behaviours between types
// when you enter this, you use self.type and other.type like this :
// self.type = UNIVERSAL_POWER_GRID[self.type][other.type]
// it basically says what it becomes on contact with other
/** e.g.
 * object1.type = 0; -> cisors
 * object2.type = 1; -> paper
 * -- CONTACT !
 * object1.type = UNIVERSAL_POWER_GRID[object1.type][object2.type] -> UNIVERSAL_POWER_GRID[0][1] -> 0 which's correct because cisors stays at cisors when touching papers
 * object2.type = UNIVERSAL_POWER_GRID[object2.type][object1.type] -> UNIVERSAL_POWER_GRID[1][0] -> 0 which's correct because papers becomes cisors when touching cisors
 */


let oldTimeStamp = 0;
let secondsPassed = 0;

canvas.width = MAPSIZEX;
canvas.height = MAPSIZEY;





class GameObject {
    constructor(context, x, y, vx, vy, type, radius) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.radius = radius;
    }

    
    update(secondsPassed) {
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
    }
}
class Square extends GameObject {
    constructor(context, x, y, vx, vy, size, type) {
        super(context, x, y, vx, vy, type);
        this.size = size;
    }

    draw() {
        this.context.drawImage(imageCisorsPaperRock[this.type], this.x, this.y, this.size, this.size);
    }
}



let gameObjects = [];


function createWorld() {
    // gameObjects.push(new Square(context,
    //     500,
    //     350,
    //     0,
    //     100,
    //     GAMEOBJECTRADIUS,
    //     2,
    // ));
    // gameObjects.push(new Square(context,
    //     500,
    //     750,
    //     0,
    //     -100,
    //     GAMEOBJECTRADIUS,
    //     1,
    // ));

    const possibleTypes = UNIVERSAL_POWER_GRID.length;
    for (let i = 0; i < NUMBEROFOBJECTS; i++) {
        gameObjects.push(new Square(context,
            Math.floor(Math.random() * MAPSIZEX),
            Math.floor(Math.random() * MAPSIZEY),
            (Math.floor(Math.random() * GENERATIONOBJECTMAXSPEED) - GENERATIONOBJECTMINSPEED) / DISPLAYRATE,
            (Math.floor(Math.random() * GENERATIONOBJECTMAXSPEED) - GENERATIONOBJECTMINSPEED) / DISPLAYRATE,
            GAMEOBJECTRADIUS / DISPLAYRATE,
            Math.floor(Math.random() * possibleTypes),
        ));
    }

    return;
}
function clearCanvas() {
    context.beginPath();
    context.fillStyle = DEFAULT_MAP_BACKGROUND;
    context.fillRect(0, 0, MAPSIZEX, MAPSIZEY);
    context.closePath();
}

function detectCollisions() {
    let temp_length = gameObjects.length;
    for (let i = 0; i < temp_length; i++)
    {
        for (let j = i + 1; j < temp_length; j++)
        {
            if (isSquaresIntersect(gameObjects[i].x, gameObjects[i].y, gameObjects[i].size, gameObjects[j].x, gameObjects[j].y, gameObjects[j].size)) {
                collisionShock(gameObjects[i], gameObjects[j]);
            }
        }
    }
}


// hitboxes are squares, much more easier
function isRectanglesIntersect(xPos1, yPos1, width1, height1, xPos2, yPos2, width2, height2) {
    if (xPos2 > width1 + xPos1 || xPos1 > width2 + xPos2 || yPos2 > height1 + yPos1 || yPos1 > height2 + yPos2) {
        return false;
    }
    return true;
}
function isSquaresIntersect(xPos1, yPos1, size1, xPos2, yPos2, size2) {
    return isRectanglesIntersect(xPos1, yPos1, size1, size1, xPos2, yPos2, size2, size2);
}


function collisionShock(object1, object2) {
    let vCollision = {x: object2.x - object1.x, y: object2.y - object1.y};
    let distance = Math.sqrt((object2.x-object1.x)*(object2.x-object1.x) + (object2.y-object1.y)*(object2.y-object1.y));
    let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};

    let vRelativeVelocity = {x: object1.vx - object2.vx, y: object1.vy - object2.vy};
    let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
    if (speed < 0) {
        return;
    }
    object1.vx -= speed * vCollisionNorm.x * COLLISIONRESTITUTION;
    object1.vy -= speed * vCollisionNorm.y * COLLISIONRESTITUTION;
    object2.vx += speed * vCollisionNorm.x * COLLISIONRESTITUTION;
    object2.vy += speed * vCollisionNorm.y * COLLISIONRESTITUTION;
    
    if (object1.type === object2.type) {
        return;
    }
    // this define the object.type from the UNIVERSAL_POWER_GRID using self.type and other.type, refer to comments on top of 'UNIVERSAL_POWER_GRID'
    object1.type = UNIVERSAL_POWER_GRID[object1.type][object2.type]
    object2.type = UNIVERSAL_POWER_GRID[object2.type][object1.type]
}

function detectEdgeCollisions() {
    for (let i = 0; i < gameObjects.length; i++)
    {
        if (gameObjects[i].x < 0) {
            gameObjects[i].vx = Math.abs(gameObjects[i].vx) * EDGERESTITUTION;
            gameObjects[i].x = 0;
        } else if (gameObjects[i].x > MAPSIZEX - gameObjects[i].size) {
            gameObjects[i].vx = -Math.abs(gameObjects[i].vx) * EDGERESTITUTION;
            gameObjects[i].x = MAPSIZEX - gameObjects[i].size;
        }

        if (gameObjects[i].y < 0) {
            gameObjects[i].vy = Math.abs(gameObjects[i].vy) * EDGERESTITUTION;
            gameObjects[i].y = 0;
        } else if (gameObjects[i].y > MAPSIZEY - gameObjects[i].size) {
            gameObjects[i].vy = -Math.abs(gameObjects[i].vy) * EDGERESTITUTION;
            gameObjects[i].y = MAPSIZEY - gameObjects[i].size;
        }
    }
}

function gameLoop(timeStamp) {
        secondsPassed = (timeStamp - oldTimeStamp) / 1000;
        oldTimeStamp = timeStamp;
        
    
        for (let i = 0; i < gameObjects.length; i++) {
            gameObjects[i].update(secondsPassed);
        }
    
        detectCollisions();
        detectEdgeCollisions();
    
        clearCanvas();
    
        for (let i = 0; i < gameObjects.length; i++) {
            gameObjects[i].draw();
        }
    
        window.requestAnimationFrame(gameLoop);
}


function validateUniverseThings() {
    let universalPowerGridLength = UNIVERSAL_POWER_GRID.length;
    UNIVERSAL_POWER_GRID.forEach(type => {
        if (type.length != universalPowerGridLength) {
            throw new Error("UNIVERSAL_POWER_GRID doesn't have a square shape (all 'lines' of 'UNIVERSAL_POWER_GRID' must have the same length than 'UNIVERSAL_POWER_GRID')");
        }
    });

    if (imageCisorsPaperRock.length != universalPowerGridLength) {
        throw new Error("Not enough images for the possible types (length of 'imageCisorsPaperRock' is not the same as 'UNIVERSAL_POWER_GRID')");
    }
}



validateUniverseThings();

createWorld();
gameLoop(1);