Ship = (x, y, size) => {
  const ship = {}
  ship.pos = createVector(x, y)
  ship.size = size
  ship.rot = 90
  ship.rotationRate = 3

  ship.velocity = createVector(0, 0)
  ship.maxSpeed = 50
  ship.acceleration = 0.1

  ship.accelerate = () => {
    ship.velocity.add(p5.Vector.fromAngle(radians(ship.rot), ship.acceleration))
  }

  ship.rotate = dir => {
    ship.rot += ship.rotationRate * dir
    ship.rot %= 360
  }

  ship.move = () => {
    ship.pos.add(ship.velocity)
  }

  ship.draw = () => {
    const rad = radians(ship.rot)
    applyMatrix(cos(rad), sin(rad), -sin(rad), cos(rad), ship.pos.x, ship.pos.y)
    ship.drawHull()
    resetMatrix()
  }

  ship.drawHull = () => {
    fill(0)
    stroke(255)
    triangle(
      7*ship.size, 0, 
      -3*ship.size, -3*ship.size, 
      -3*ship.size, 3*ship.size)
  }

  return ship
}