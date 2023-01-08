let canvas = document.getElementById("main");
let context = canvas.getContext("2d");


const MAPSIZEX = 1300;
const MAPSIZEY = 900;
const EDGERESTITUTION = 1;
const COLLISIONRESTITUTION = 1;
const NUMBEROFOBJECTS = 800;

const GENERATIONOBJECTMAXSPEED = 500;
const GENERATIONOBJECTMINSPEED = 500;

const GAMEOBJECTRADIUS = 25;

// the rate of the display (10 makes it 1:10)
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

/* type graph :
    0 is cisor
    1 is paper
    2 is rock
    0 wins to 1
    1 wins to 2
    2 wins to 0
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
        // this.context.fillStyle = '#ff8080';
        // this.context.fillRect(this.x, this.y, this.width, this.height);

        // console.log(this.vx, this.vy);

        this.context.drawImage(this.type === 0 ? scissorsImage : this.type === 1 ? paperImage : rockImage, this.x, this.y, this.size, this.size);
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

    for (let i = 0; i < NUMBEROFOBJECTS; i++) {
        gameObjects.push(new Square(context,
            Math.floor(Math.random() * MAPSIZEX),
            Math.floor(Math.random() * MAPSIZEY),
            Math.floor(Math.random() * GENERATIONOBJECTMAXSPEED) - GENERATIONOBJECTMINSPEED,
            Math.floor(Math.random() * GENERATIONOBJECTMAXSPEED) - GENERATIONOBJECTMINSPEED,
            GAMEOBJECTRADIUS,
            Math.floor(Math.random() * 3),
        ));
    }

    return;
}
function clearCanvas() {
    context.beginPath();
    context.fillStyle = "white";
    context.fillRect(0, 0, MAPSIZEX, MAPSIZEY);
    context.closePath();
}

function detectCollisions() {
    let object1, object2;

    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].isColliding = false;
    }

    let temp_length = gameObjects.length;
    for (let i = 0; i < temp_length; i++)
    {
        object1 = gameObjects[i];
        for (let j = i + 1; j < temp_length; j++)
        {
            object2 = gameObjects[j];
            if (rectIntersect(object1.x, object1.y, object1.size, object1.size, object2.x, object2.y, object2.size, object1.size)) {
                collisionShock(object1, object2);
            }
        }
    }
}


function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
        return false;
    }
    return true;
}


// function circleIntersect(x1, y1, r1, x2, y2, r2) {
//     let circleDistance = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
//     return circleDistance <= ((r1 / DISPLAYRATE + r2 / DISPLAYRATE) * (r1 / DISPLAYRATE + r2 / DISPLAYRATE))
// }


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
    
    /* type graph :
        0 is cisor
        1 is paper
        2 is rock
        0 wins to 1
        1 wins to 2
        2 wins to 0
    */


    // put this before set of (object)vx/vy to ignore collision between object with same type
    if (object1.type === object2.type) {
        return;
    }

    // console.log(object1.type, object2.type);
    // THIS is horrible but "flemme"
    if (object1.type === 0 && object2.type === 1) {
        object2.type = 0;
    }
    else if (object1.type === 1 && object2.type === 2) {
        object2.type = 1;
    }
    else if (object1.type === 2 && object2.type === 0) {
        object2.type = 2;
    }
    else if (object1.type === 1 && object2.type === 0) {
        object1.type = 0;
    }
    else if (object1.type === 2 && object2.type === 1) {
        object1.type = 1;
    }
    else if (object1.type === 0 && object2.type === 2) {
        object1.type = 2;
    }

    // console.log(object1.type, object2.type);
}

function detectEdgeCollisions() {
    let object;
    for (let i = 0; i < gameObjects.length; i++)
    {
        object = gameObjects[i];

        if (object.x < 0) {
            object.vx = Math.abs(object.vx) * EDGERESTITUTION;
            object.x = 0;
        } else if (object.x > MAPSIZEX - object.size) {
            object.vx = -Math.abs(object.vx) * EDGERESTITUTION;
            object.x = MAPSIZEX - object.size;
        }

        if (object.y < 0) {
            object.vy = Math.abs(object.vy) * EDGERESTITUTION;
            object.y = 0;
        } else if (object.y > MAPSIZEY - object.size) {
            object.vy = -Math.abs(object.vy) * EDGERESTITUTION;
            object.y = MAPSIZEY - object.size;
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

createWorld();
gameLoop(1);