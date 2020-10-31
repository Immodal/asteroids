Game = (ai, seed=null) => {
  const gm = {}

  /**
   * Initialize values
   */
  const init = () => {
    // Set seed used for generating initial conditions.
    // There shouldn't be any other randomness left in the game.
    gm.seed = seed
    randomSeed(gm.seed)
    
    gm.nAsteroids = 15
    gm.score = 0
    gm.over = false
    gm.ship = FakeShip(width/2, height/2, 15, ai)
    gm.asteroids = Array.from(Array(gm.nAsteroids-1), (_, i) => gm.spawnAsteroid(i==0))
    //gm.asteroids.push(Asteroid(width*0.4, height*0.5, createVector(100, 0)))
    gm.lasers = []
    gm.updateCount = 0
    return gm
  }

  /**
   * Updates all game logic
   */
  gm.update = (auto=true) => {
    if (!gm.over) {
      gm.updateCount += 1
      if(auto) gm.ship.takeActions(gm.updateCount, gm.lasers)
      gm.ship.move()
      gm.asteroids.forEach(o => o.move())

      for(let i=gm.lasers.length-1; i>=0; i--) {
        gm.lasers[i].move()
        if (gm.lasers[i].isDepleted(gm.updateCount)) gm.lasers.splice(i, 1)
        else {
          for(let j=gm.asteroids.length-1; j>=0; j--) {
            if (gm.lasers[i].collides(gm.asteroids[j])) {
              gm.lasers.splice(i, 1)
              gm.ship.shotHits += 1
              gm.asteroids.push(...gm.asteroids[j].breakUp())
              gm.asteroids.splice(j, 1)
              gm.score += 1
              break
            }
          }
        }
      }

      if (gm.asteroids.length==0) gm.over = true
      else gm.asteroids.forEach(o => { if (o.collides(gm.ship)) gm.over = true })

      //if (gm.asteroids.length<gm.nAsteroids) gm.asteroids.push(gm.spawnAsteroid())
      gm.ship.scan(gm.asteroids)
    }
  }

  /**
   * Draw function to be called by sketch.js
   */
  gm.draw = (showRC=true, showNN=true) => {
    gm.asteroids.forEach(o => o.draw())
    gm.ship.draw(showRC)
    gm.lasers.forEach(o => o.draw())
    if(showNN && gm.ship.ai!=null) gm.ship.ai.draw(0, 0, 200, height)
  }

  /**
   * Checks all valid keyboard for input
   */
  gm.actions = () => {
    if (!gm.over) {
      if (keyIsDown(38) || keyIsDown(87)) gm.ship.accelerate() // up
      if (keyIsDown(37) || keyIsDown(65)) gm.ship.rotate(-1) // left
      if (keyIsDown(39) || keyIsDown(68)) gm.ship.rotate(1) // right
      if (keyIsDown(32) && gm.ship.shoot(gm.updateCount)) gm.lasers.push(Laser(gm.updateCount, gm.ship)) // space
    }
  }

  /**
   * Spawn asteroid at the edge of the screen to prevent spawning on top of player
   */
  gm.spawnAsteroid = (aimAtShip=false) => {
    const spawn = () => {
      return Asteroid(random(0, width), random(0, height))
      // TODO Fix this
      //const velocity = aimAtShip ? createVector(gm.ship.pos.x, gm.ship.pos.y) : null
      //return Asteroid(random(0, width), random(0, height), velocity)
    }
    let ast = spawn()
    while (ast.pos.dist(gm.ship.pos)<ast.diameter*1.5) {
      ast = spawn()
    }
    return ast
  }

  return init()
}