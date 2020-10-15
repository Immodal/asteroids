Game = () => {
  const gm = {}

  gm.score = 0

  /**
   * Draw function to be called by sketch.js
   */
  gm.draw = () => {
    // Game Logic
    const now = millis()
    if (!gm.over && now - gm.lastUpdate > gm.updateInterval) {
      gm.ship.move()
      gm.asteroids.forEach(o => o.move())

      for(let i=gm.lasers.length-1; i>=0; i--) {
        gm.lasers[i].move()
        if (gm.lasers[i].isDepleted()) gm.lasers.splice(i, 1)
        else {
          for(let j=gm.asteroids.length-1; j>=0; j--) {
            if (gm.lasers[i].collides(gm.asteroids[j])) {
              gm.lasers.splice(i, 1)
              gm.asteroids.push(...gm.asteroids[j].breakUp())
              gm.asteroids.splice(j, 1)
              gm.score += 1
              break
            }
          }
        }
      }

      gm.asteroids.forEach(o => {if (o.collides(gm.ship)) gm.over = true})
      gm.ship.scan(gm.asteroids)
      gm.lastUpdate = now
    }
    
    // Draw functions
    gm.asteroids.forEach(o => o.draw())
    gm.lasers.forEach(o => o.draw())
    gm.ship.draw(gm._forwardKeysDown(), true)
    gm.drawScore()
  }

  /**
   * Draw score for current game on the Canvas
   */
  gm.drawScore = () => {
    fill(255)
    textSize(32);
    text(gm.score, 10, 30);
  }

  /**
   * Checks all valid keyboard for input
   */
  gm.actions = () => {
    if (!gm.over) {
      if (gm._forwardKeysDown()) gm.ship.accelerate() // up
      if (keyIsDown(37) || keyIsDown(65)) gm.ship.rotate(-1) // left
      if (keyIsDown(39) || keyIsDown(68)) gm.ship.rotate(1) // right
      if (keyIsDown(32) && gm.ship.shoot()) gm.lasers.push(Laser(gm.ship)) // space
    }
  }

  /**
   * Keys for moving forward
   */
  gm._forwardKeysDown = () => keyIsDown(38) || keyIsDown(87)

  /**
   * Spawn asteroid at the edge of the screen to prevent spawning on top of player
   */
  gm.spawnAsteroid = () => {
    const left = () => Asteroid(0, math.random(0, height))
    const right = () => Asteroid(width, math.random(0, height))
    const top = () => Asteroid(math.random(0, width), 0)
    const bottom = () => Asteroid(math.random(0, width), height)
    return math.pickRandom([left, right, top, bottom])()
  }

  gm.over = false
  gm.ship = Ship(250, 250, 15)
  gm.asteroids = Array.from(Array(10), gm.spawnAsteroid)
  gm.lasers = []
  gm.lastUpdate = 0
  gm.updateInterval = 10

  return gm
}