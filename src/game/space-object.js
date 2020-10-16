/**
 * Base object for most things in the game
 */
SpaceObject = (x, y, diameter, rotation, rotationRate, velocity, maxSpeed, acceleration) => {
  const obj = {}
  obj.pos = createVector(x, y) // Starting Position
  obj.diameter = diameter // Diameter before multiplier
  
  obj.rotation = rotation // Rotation in Radians
  obj.rotationRate = rotationRate

  obj.velocity = velocity
  obj.maxSpeed = maxSpeed
  obj.acceleration = acceleration
  obj.accelerated = false

  /**
   * Increase velocity
   */
  obj.accelerate = () => {
    // Create an acceleration vector based on the direction the ship is facing 
    // with magnitude equal to ship.acceleration
    obj.velocity.add(p5.Vector.fromAngle(obj.rotation, obj.acceleration))
    obj.velocity.limit(obj.maxSpeed)
    obj.accelerated = true
  }

  /**
   * Rotate the object
   * @param {Integer} dir 1 for CW and -1 for CCW
   */
  obj.rotate = dir => {
    obj.rotation += obj.rotationRate * dir
    obj.rotation = obj.rotation < 0 ? TWO_PI - obj.rotation : obj.rotation
    obj.rotation %= TWO_PI // Prevent number from getting too big or small
  }

  /**
   * Update the object's location given its current velocity
   */
  obj.move = () => {
    obj.pos.add(obj.velocity)
    // X
    if (obj.pos.x > width + obj.diameter) obj.pos.x = 0 - obj.diameter
    else if (obj.pos.x < 0 - obj.diameter) obj.pos.x = width + obj.diameter
    // Y
    if (obj.pos.y > height + obj.diameter) obj.pos.y = 0 - obj.diameter
    else if (obj.pos.y < 0 - obj.diameter) obj.pos.y = height + obj.diameter
  }

  /**
   * Check for collisions with other objects
   * @param {SpaceObject} other 
   */
  obj.collides = other => obj.pos.dist(other.pos) < (obj.diameter/2 + other.diameter/2)

  return obj
}