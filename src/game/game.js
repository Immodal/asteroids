Game = ai => {
  const gm = {}

  /**
   * Updates all game logic
   */
  gm.update = () => {
    if (!gm.over) {
      gm.updateCount += 1
      gm.ship.takeActions(gm.updateCount, gm.lasers)
      gm.ship.move()
      gm.asteroids.forEach(o => o.move())

      for(let i=gm.lasers.length-1; i>=0; i--) {
        gm.lasers[i].move()
        if (gm.lasers[i].isDepleted(gm.updateCount)) gm.lasers.splice(i, 1)
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

      gm.asteroids.forEach(o => {
        if (o.collides(gm.ship)) {
          gm.over = true
          gm.stopTime = gm.updateCount
        }
      })
      if (gm.asteroids.length<gm.nAsteroids) gm.asteroids.push(gm.spawnAsteroid())
      gm.ship.scan(gm.asteroids)
    }
  }

  /**
   * Draw function to be called by sketch.js
   */
  gm.draw = () => {
    gm.asteroids.forEach(o => o.draw())
    gm.ship.draw(true)
    gm.lasers.forEach(o => o.draw())
    gm.drawScore()
  }

  /**
   * Draw score for current game on the Canvas
   */
  gm.drawScore = () => {
    stroke(0)
    fill(255)
    textSize(32);
    text(gm.score, 10, 30);
  }

  /**
   * Checks all valid keyboard for input
   */
  gm.actions = () => {
    if (!gm.over) {
      if (keyIsDown(38) || keyIsDown(87)) gm.ship.accelerate() // up
      if (keyIsDown(37) || keyIsDown(65)) gm.ship.rotate(-1) // left
      if (keyIsDown(39) || keyIsDown(68)) gm.ship.rotate(1) // right
      if (keyIsDown(32) && gm.ship.shoot()) gm.lasers.push(Laser(gm.updateCount, gm.ship)) // space
    }
  }

  /**
   * Spawn asteroid at the edge of the screen to prevent spawning on top of player
   */
  gm.spawnAsteroid = (anywhere=true) => {
    const left = () => Asteroid(0, math.random(0, height))
    const right = () => Asteroid(width, math.random(0, height))
    const top = () => Asteroid(math.random(0, width), 0)
    const bottom = () => Asteroid(math.random(0, width), height)
    const spawn = () => anywhere ? 
      Asteroid(math.random(0, width), math.random(0, height)) : 
      math.pickRandom([left, right, top, bottom])()

    let ast = spawn()
    while (ast.pos.dist(gm.ship.pos)<ast.diameter*1.5) ast = spawn()
    return ast
  }

  gm.nAsteroids = 20
  gm.score = 0
  gm.over = false
  gm.stopTime = 0
  gm.ship = Ship(width/2, height/2, 45, ai)
  gm.asteroids = Array.from(Array(gm.nAsteroids), gm.spawnAsteroid)
  gm.lasers = []
  gm.updateCount = 0

  return gm
}