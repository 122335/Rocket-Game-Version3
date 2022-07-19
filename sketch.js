var bg, rocket, rocketImg;
var fuel,
  fuelImg,
  obstacle,
  obstacleImg,
  star,
  starImg,
  ufo,
  ufoImg,
  bullet,
  bulletImg,
  blastImg;
var fuelGroup, obstacleGroup, starGroup, ufoGroup, bulletGroup;
var crash, shoot, explosion, fuelFilling;
var gameState = "start";
var score = 0;
var life = 3;
var fuel = 185;

function preload() {
  // put preload code here
  bg = loadImage("./assets/images/background.jpg");
  rocketImg = loadImage("./assets/images/rocket.png");
  fuelImg = loadImage("./assets/images/Fuel.png");
  obstacleImg = loadImage("./assets/images/obstacle.png");
  starImg = loadImage("./assets/images/Star.png");
  ufoImg = loadImage("./assets/images/UFO.png");
  bulletImg = loadImage("./assets/images/bullet.png");
  blastImg = loadImage("./assets/images/blast.png");
  crash = loadSound("./assets/sounds/crash.wav");
  shoot = loadSound("./assets/sounds/shoot.wav");
  explosion = loadSound("./assets/sounds/explosion.mp3");
  fuelFilling = loadSound("./assets/sounds/fuel.mp3");
}

function setup() {
  createCanvas(1600, 900);
  // put setup code here
  rocket = createSprite(800, 800, 50, 50);
  rocket.addImage("rocket", rocketImg);
  rocket.addImage("explosion", blastImg);
  rocket.scale = 0.3;

  fuelGroup = new Group();
  obstacleGroup = new Group();
  starGroup = new Group();
  ufoGroup = new Group();
  bulletGroup = new Group();
}

function draw() {
  if (gameState === "start") {
    background(bg);
    image(rocketImg, width / 4, height / 2 - 190);
    textSize(50);
    text("Space Shooter", width / 2 - 100, height / 2 - 300);
    textSize(20);
    text("Use LEFT and RIGHT arrow keys to move rocket LEFT and RIGHT", width / 2 - 100, height / 2 - 200);
    text("Use SPACE arrow key to shoot the UFOs and earn 7 points", width / 2 - 100, height / 2 - 150);
    text("Collect stars to earn 5 points", width / 2 - 100, height / 2 - 100);
    text("Collect fuel to refill your fuel", width / 2 - 100, height / 2 - 50);
    text("Dodge UFOs else you lose 3 points", width / 2 - 100, height / 2);
    text("Dodge Bolders else you lose 1 life", width / 2 - 100, height / 2 + 50);
    textSize(30);
    fill("#ffffff");
    text("Click to start", width / 2 - 100, height / 2 + 250);
    text("__________", width / 2 - 100, height / 2 + 260);
  }
  if (gameState == "play") {
    // put drawing code here
    background(bg);
    rocket.changeImage("rocket");
    textSize(25);
    fill("#ffffff");
    text("Score: " + score, 10, 30);
    text("Life:    " + life, 10, 60);
    showFuelBar();

    addSprites(fuelGroup, 1, fuelImg, 0.1);
    addSprites(obstacleGroup, 2, obstacleImg, 0.5);
    addSprites(starGroup, 4, starImg, 0.1);
    addSprites(ufoGroup, 3, ufoImg, 0.1);

    // player movement
    if (keyDown("left_arrow")) {
      rocket.x -= 6;
      if (fuel > 0) {
        fuel -= 1;
      } else {
        gameEnd();
      }
    }

    if (keyDown("right_arrow")) {
      rocket.x += 6;
      if (fuel > 0) {
        fuel -= 1;
      } else {
        gameEnd();
      }
    }

    if (keyDown("space")) {
      shootBullet();
    }

    // player events
    if (starGroup.isTouching(rocket)) {
      handleStars();
    }

    if (obstacleGroup.isTouching(rocket)) {
      handleObstacles();
    }

    if (ufoGroup.isTouching(rocket)) {
      handleUFOs();
    }

    if (ufoGroup.isTouching(bulletGroup)) {
      handleBullet();
    }

    if (fuelGroup.isTouching(rocket)) {
      handleFuel();
    }

    if (frameCount % 150 == 0) {
      if (fuel > 0) {
        fuel -= 1;
      } else {
        gameEnd();
      }
    }

    // game events
    if (life == 0 || fuel <= 0) {
      gameState = "end";
    }

    drawSprites();
  }

  if (gameState == "pause") {
    ufoGroup.destroyEach();
    obstacleGroup.destroyEach();
    starGroup.destroyEach();
    fuelGroup.destroyEach();
    bulletGroup.destroyEach();
  }

  if (gameState == "end") {
    gameEnd();
  }
}

function addSprites(
  spriteGroup,
  numberOfSprites,
  spriteImage,
  scale,
  positions = []
) {
  if (frameCount % 150 === 0) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      //C41 //SA
      if (positions.length > 0) {
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      } else {
        x = random(0, width);
        y = 0;
      }
      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);
      sprite.velocityY = random(1, 3);
      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }
}

function handleStars() {
  rocket.overlap(starGroup, function (collector, collected) {
    collected.remove();
    score += 5;
  });
}

function handleObstacles() {
  rocket.overlap(obstacleGroup, function (collector, collected) {
    collected.remove();
    life -= 1;
    crash.play();
    crash.setVolume(0.3);
  });
}

function handleUFOs() {
  rocket.overlap(ufoGroup, function (collector, collected) {
    // player.fuel = 185;
    rocket.changeImage("explosion");
    collected.remove();
    score -= 3;
    gameState = "pause";
    crash.play();
    crash.setVolume(0.3);
  });
}

function handleFuel() {
  rocket.overlap(fuelGroup, function (collector, collected) {
    collected.remove();
    if (fuel > 0) {
      fuel += 50;
      fuelFilling.play();
      fuelFilling.setVolume(0.3);
    } else {
      fuel = 0;
    }
  });
}

function handleBullet() {
  bulletGroup.overlap(ufoGroup, function (collector, collected) {
    // player.fuel = 185;
    collected.remove();
    bullet.remove();
    score += 7;
    explosion.play();
    explosion.setVolume(0.3);
  });
}

function shootBullet() {
  bullet = createSprite(rocket.x, rocket.y);
  bullet.addImage(bulletImg);
  bullet.addImage("explosion", blastImg);
  bullet.velocityY = -6;
  bullet.scale = 0.1;
  bulletGroup.add(bullet);
  shoot.play();
  shoot.setVolume(0.3);
}

function mouseClicked() {
  gameState = "play";
  console.log("mousePressed");
}

function gameEnd() {
  textSize(50);
  text("Game Over", width / 2 - 100, height / 2);
  fuelGroup.destroyEach();
  obstacleGroup.destroyEach();
  starGroup.destroyEach();
  ufoGroup.destroyEach();
  rocket.destroy();
}

function showFuelBar() {
  push();
  image(fuelImg, width - 240, 40, 40, 40);
  fill("#ffffff");
  rect(width - 200, 50, 185, 20);
  fill("#ffc400");
  rect(width - 200, 50, fuel, 20);
  noStroke();
  pop();
}
