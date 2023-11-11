title = "Crazy Truck";
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
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 16,
};

const G = {
  WIDTH: 100,
  HEIGHT: 150,
  SPAWNRATE: 50,
  OBSTACLEMOVERATE: 0.5,
};

let horizontalVelocity = 0;
let verticalLevel = 0;
let spawn = G.SPAWNRATE;
let pin;
let player;
let obstacles = [];
let counter = 0;

let haystack = [];
let timer = 60;

// Initialization function
function initializeGame() {
  // Reset player position and properties
  player = {
    pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
    angle: 0,
  };

  // Reset other game variables
  horizontalVelocity = 0;
  verticalLevel = 0;
  spawn = G.SPAWNRATE;
  obstacles = [];
  counter = 0;
  haystack = [];
  timer = 60;
}

// Example usage: restart the game when a key is pressed
if (input.isJustPressed) {
  initializeGame();
}

function update() {
  if (!ticks) {
  }

  timer--;
  if (timer == 0) {
    addScore(1);
    timer = 60;
  }

  player = {
    pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
    angle: 0,
    alive: true,
  };

  // Player update
  player.pos.x = clamp(player.pos.x + horizontalVelocity, 0, G.WIDTH);
  player.pos.y = clamp(player.pos.y + verticalLevel, 0, G.HEIGHT);
  color("black");
  char("a", player.pos);

  if (player.pos.x == 0 || player.pos.x == G.WIDTH) {
    play("hit");
    verticalLevel += player.pos.x === 0 ? 1 : -1;
  }

  // Handle Death
  if (player.pos.y > 100) {
    end();
    initializeGame();
    return;
  }

  spawn -= 1;
  if (spawn <= 0) {
    // Create the bullet
    obstacles.push({
      pos: vec(player.pos.x, 0),
    });
    // Reset the firing cooldown
    spawn = G.SPAWNRATE;
  }

  obstacles.forEach((fb) => {
    // Move the bullets down
    fb.pos.y += G.OBSTACLEMOVERATE;

    // Drawing Haystaks
    color("yellow");
    box(fb.pos, 5);
  });
  color("black");

  if (input.isPressed) {
    // player.angle += player.angle == 90 ? 1 : 0;
    horizontalVelocity += 1;
  } else {
    // player.angle -= player.angle == -90 ? 1 : 0;
    horizontalVelocity -= 1;
  }
  // playing with obstacle spawn
  verticalLevel -= 0.1;

   const isCollidingWithObs = char("a", player.pos).isColliding.rect.yellow;
   // Check whether to make a small particle explosin at the position
   if (isCollidingWithObs) {
     verticalLevel += 3;
     play("explosion");
   }
}
