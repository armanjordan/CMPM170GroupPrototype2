title = "Broken Pedal";
// note changing the description changes the sfx
description = `
  [Hold] ->
  [Release] <-
`;

characters = [
  `
LrrrrL
LrrrrL
 rccr
 rccr 
LrrrrL
LrrrrL
`,
  `
YYYYYY
YYYYYY
YYYYYY
YYYYYY
`,

  `
rr
ryly
 lyyyy
 yyyy
  yyy
  y
`,

  `
y
y
y
y
y
y
`,
`

  GG
 GGGG
 GGGG
GGGGGG
  YY
  YY
`,
`
LbbbbL
LbbbbL
 bccb
 bccb 
LbbbbL
LbbbbL
`,
`
LyyyyL
LyyyyL
 yccy
 yccy 
LyyyyL
LyyyyL
`,
];

/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} defaultparticles
 */

/**
 * @type {defaultparticles [] }
 *
 */
let backgroundParticles;

/**
 * @typedef {{
 * pos: Vector,
 * movementX: Number,
 * movementY: Number,
 * type: string,
 * }} obstacle
 */

let obstacles = [];

options = {
  theme: "crt",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 16,
};

const G = {
  WIDTH: 100,
  HEIGHT: 100,
  HAYSPAWNRATE: 50,
  BIRDSPAWNRATE: 200,
  HAYSTACKSPEED: 2,
  PARTICLE_SPEED_MIN: 0.5,
  PARTICLE_SPEED_MAX: 1.0,
  OBSTACLEMOVERATE: 0.5,
  PLAYER_SPEED: 0.1,
  PLAYER_SPEED_GRASS_COEF: -2,
  PLAYER_LIVES: 3,
  STOP_HEIGHT: 40,
  ROAD_WIDTH: 62
};

function createRoad() {
  color("green");
  box(G.WIDTH / 2, G.HEIGHT / 2, G.WIDTH, G.HEIGHT);
  color("white");
  box(G.WIDTH / 2, G.HEIGHT / 2, G.ROAD_WIDTH, G.HEIGHT);
}

function CreateBackgroundParticles() {
  backgroundParticles = times(7, () => {
    const posX = (G.WIDTH + rndi(-G.ROAD_WIDTH, G.ROAD_WIDTH)) / 2;
    const posY = rnd(0, G.HEIGHT);
    return {
      pos: vec(posX, posY),
      speed: G.HAYSTACKSPEED,
    };
  });
}

function UpdateBackgroundParticles() {
  backgroundParticles.forEach((s) => {
    const oldPosY = s.pos.y;
    s.pos.y += s.speed;
    // console.log(s.pos.y);
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    if (s.pos.y < oldPosY) {
      s.pos.y = rndi(0, -10);
      s.pos.x = (G.WIDTH + rndi(-G.ROAD_WIDTH, G.ROAD_WIDTH)) / 2;
    }
    color("light_black");
    box(s.pos, 1);
  });
}

let horizontalVelocity = 0;
let verticalVelocity = 0;
let spawnHayTimer = G.HAYSPAWNRATE;
let spawnBirdTimer = G.BIRDSPAWNRATE;
let pin;
let player;
let counter = 0;

let haystack = [];
let lines = [];
let timer = 60;

function initializeGame() {
  player = {
    pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
    angle: 0,
    lives: G.PLAYER_LIVES
  };

  // Reset other game variables
  horizontalVelocity = 0;
  spawnHayTimer = G.HAYSPAWNRATE;
  counter = 0;
  haystack = [];
  obstacles = [];
  timer = 60;
}

// Example usage: restart the game when a key is pressed
// if (input.isJustPressed) {
//   initializeGame();
// }

function update() {
  if (!ticks) {
    if (input.isJustPressed) {
      initializeGame();
    }
    CreateBackgroundParticles();
  }

  timer--;
  if (timer == 0) {
    addScore(1);
    timer = 60;
  }

  // player = {
  //   startPos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
  //   pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
  //   angle: 0,
  //   lives: G.PLAYER_LIVES,
  // };

  createRoad();
  // Player update
  // Pos is (50, 75), add verticalLevel and horizontalVelocity to get current position (they are NOT change in position )
  horizontalVelocity = input.isPressed ? 1 : -1; // Handles Input

  player.pos.x = clamp(player.pos.x + horizontalVelocity, 0, G.WIDTH);
  player.pos.y = clamp(player.pos.y + verticalVelocity, G.STOP_HEIGHT, G.HEIGHT);
  // console.log(player.pos);
  // After this point, pos reflects actual position
  color("black");
  char("a", player.pos);
  UpdateBackgroundParticles();

  // Handle Death
  if (player.pos.y >= G.HEIGHT) {
    end();
    initializeGame();
    return;
  }
  color("black");
  
  spawnBirds();
  spawnHaystacks();
  spawnTrees();
  spawnCars();
  moveObstacles();
  spawnLines();
  moveLines();
  color("black");
  // playing with obstacle spawn
  verticalVelocity = -G.PLAYER_SPEED * (player.pos.x < (G.WIDTH - G.ROAD_WIDTH) / 2 || player.pos.x > (G.WIDTH + G.ROAD_WIDTH) / 2 ? G.PLAYER_SPEED_GRASS_COEF : 1);
  handleCollsion();

}

function spawnBirds() {
  spawnBirdTimer -= 1;
  const random = Math.random();
  let spawnAreaX = random < 0.5 ? 0 : G.WIDTH;
  let movementXChange = spawnAreaX == 0 ? rnd(.5, 1.5) : -rnd(.5, 1.5);
  const spawnAreaY = rnd(0, G.HEIGHT);
  let movementYChange = (spawnAreaY <= G.HEIGHT/2.0 ? rnd(.5, 1.5): -rnd(.5, 1.5)) + G.OBSTACLEMOVERATE;
  if (spawnBirdTimer <= 0) {
    const bird = {
      pos: vec(spawnAreaX, spawnAreaY),
      movementX: movementXChange,
      movementY: movementYChange,
      type: "bird",
    };
    obstacles.push(bird);
    spawnBirdTimer = G.BIRDSPAWNRATE;
  }
}

let treeSpawnTimer = rnd (25, 40);
function spawnTrees(){
  treeSpawnTimer -= 1;
  if (treeSpawnTimer <= 0){
    let random = Math.random();
    let spawnAreaX = random < 0.5 ? 0 + 10 : G.WIDTH - 10;
    const tree = {
      pos: vec(spawnAreaX, -6),
      movementX: 0,
      movementY: 2,
      type: "tree"
  }
  obstacles.push(tree);
  treeSpawnTimer = rnd (25, 40);
}
}

let carSpawnTimer = rnd(100, 130);
function spawnCars() {
  carSpawnTimer -= 1;
  if(carSpawnTimer <= 0) {
    let spawnPoint = 25 + Math.floor(Math.random() * 50)
    let carColor = Math.random() <= 0.5 ? "blue" : "yellow";
    const car = {
      pos: vec(spawnPoint, -6),
      movementX: 0,
      movementY: 1,
      type: "car",
      color: carColor
    }
    obstacles.push(car);
    carSpawnTimer = rnd(100, 130);
  }
}

function spawnHaystacks() {
  // console.log("Entering spawn Haystacks");
  spawnHayTimer -= 1;
  // Spawn at random hoorizontal point on screen, weighted towards middle
  if (spawnHayTimer <= 0) {
    // Spawn at random horizontal point on screen, weighted towards middle
    let randomPoint = Math.floor(Math.random() * 50) + Math.floor(Math.random() * 50);
    const haystack = {
      pos: vec(randomPoint, -6),
      movementX: 0,
      movementY: G.HAYSTACKSPEED,
      type: "haystack",
    };
    obstacles.push(haystack);
    spawnHayTimer = G.HAYSPAWNRATE;
  }
}

function spawnLines() {
  if (ticks == 0) {
    times(4, (index) => {
      const line = {
        pos: vec(50, index * 30),
        movementX: 0,
        movementY: 2,
      };
      lines.push(line);
    });
  }
  if (ticks % 15 == 0) {
    const line = {
      pos: vec(50, 0),
      movementX: 0,
      movementY: 2,
    };
    lines.push(line);
  }
}

function moveObstacles() {
  // console.log("Entering Move obstacles");
  obstacles.forEach((fb) => {
    if (fb.type == "haystack") {
      if (fb.pos.y > G.HEIGHT) obstacles.splice(obstacles.indexOf(fb), 1);
      fb.pos.y += fb.movementY;
      color("yellow");
      char("b", fb.pos);
    } else if (fb.type == "bird") {
      const isOutOfBounds = fb.pos.x < 0 || fb.pos.x > G.WIDTH || fb.pos.y < 0 || fb.pos.y > G.HEIGHT;
      if (isOutOfBounds) obstacles.splice(obstacles.indexOf(fb), 1);
      fb.pos.x += fb.movementX;
      fb.pos.y += fb.movementY;
      color("black");
      char("c", fb.pos);
    } else if (fb.type == "tree"){
      color("black");
      fb.pos.y += fb.movementY;
      char("e", fb.pos);
    } else if (fb.type == "car") {
      color("black");
      fb.pos.y += fb.movementY;
      if (fb.color == "blue") {
        char("f", fb.pos);
      } else if (fb.color == "yellow") {
        char("g", fb.pos);
      }
    }
  });
}


function moveLines() {
  lines.forEach((l) => {
    if (l.pos.y > G.HEIGHT) lines.splice(lines.indexOf(l), 1);
    l.pos.y += l.movementY;
    color("yellow");
    char("d", l.pos);
  });
}

function handleCollsion() {
  const isCollidingWithObs = char("a", player.pos).isColliding.char.b;
  const isCollidingWithBirds = char("a", player.pos).isColliding.char.c;
  const isCollidingWithTree = char("a", player.pos).isColliding.char.e;
  const isCollidingWithCar1 = char("a", player.pos).isColliding.char.f;
  const isCollidingWithCar2 = char("a", player.pos).isColliding.char.g;

  // color("light_green");

  if (isCollidingWithBirds || isCollidingWithTree || isCollidingWithCar1 || isCollidingWithCar2) {
    end();
    initializeGame();
    return;
  }
  // Check whether colliding with barriers
  // if (player.pos.x == 0 || player.pos.x == G.WIDTH) {
  //   play("hit");
  //   currentPlayerSpeed = 1;
  // }

  if (isCollidingWithObs) {
    // Check whether to make a small particle explosion at the position
    play("explosion");
    verticalVelocity = G.HAYSTACKSPEED;
  }
  
}
