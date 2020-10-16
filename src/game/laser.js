Laser = (startTime, ship) => {
  let MAX_SPEED = 10

  const laser = SpaceObject(
    ship.pos.x, ship.pos.y, 3,
    0, 0.05,
    p5.Vector.mult(p5.Vector.fromAngle(ship.rotation),MAX_SPEED), MAX_SPEED, 0
  )

  laser.lifeTime = (width+height)*0.03
  laser.startTime = startTime

  /**
   * Check if laser is due to disappear
   */
  laser.isDepleted = currentTime => currentTime - laser.startTime > laser.lifeTime

  /**
   * Draw laser
   */
  laser.draw = () => {
    applyMatrix(cos(laser.rotation), sin(laser.rotation), -sin(laser.rotation), cos(laser.rotation), laser.pos.x, laser.pos.y)
    fill("#ff0000")
    stroke("#ff0000")
    circle(0, 0, laser.diameter)
    resetMatrix()
  }

  return laser
}