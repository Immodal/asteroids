Game = () => {
  const gm = {}
  gm.ship = Ship(250, 250, 3)

  /**
   * Draw function to be called by sketch.js
   */
  gm.draw = () => {
    gm.ship.move()
    gm.ship.draw()
  }

  gm.actions = () => {
    if (keyIsDown(38) || keyIsDown(87)) gm.ship.accelerate() // up
    if (keyIsDown(37) || keyIsDown(65)) gm.ship.rotate(-1) // left
    if (keyIsDown(39) || keyIsDown(68)) gm.ship.rotate(1) // right
  }

  return gm
}