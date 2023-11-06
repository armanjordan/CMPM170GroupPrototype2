title = "Crazy Truck";

description = `
  [Hold] <-
  [Release] ->
`;

characters = [
`
LrrrrL
LrrrrL
 rccr
 rccr 
LrrrrL
LrrrrL
`
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 16,
};

const G = {
	WIDTH: 100,
	HEIGHT: 150,
  SPAWNRATE: 10
}

let horizontalVelocity = 0;
let verticalLevel = 0;
let pin;
let player;
let obstacles;
let counter = 0;
let rot = 0;
let turnSpeed = 0.01

function update() {
  if (!ticks) {
    
  }

  player = {
    pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
    angle: 0,
  };
  player.pos = vec(G.WIDTH * 0.5 + horizontalVelocity, (G.HEIGHT - 60) + verticalLevel);
  char("a", player.pos, {rotation: rot});
  //Spawning "Haystack"



  if (input.isPressed) {
    rot += (rot != 90 ? turnSpeed : 0);
    horizontalVelocity += 1
  } else {
    rot -= (rot != -90 ? turnSpeed: 0);
    horizontalVelocity -= 1
  }
  
  verticalLevel -= 0.1

  /*
  obstacles = [];
  
  obstacles.forEach((fb) => {
    // Move the bullets upwards
    fb.pos.y -= G.FBULLET_SPEED;
    
    // Drawing
    color("yellow");
    box(fb.pos, 2);
  });

  const isCollidingWithObs = char("a", player.pos).isColliding.rect.yellow;

        // Check whether to make a small particle explosin at the position
        if (isCollidingWithFBullets) {
            color("yellow");
            particle(e.pos);
        }*/
}
