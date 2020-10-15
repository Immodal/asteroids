Ship = (x, y, diameter, nSensorRays=16) => {
  const ship = SpaceObject(
    x, y, diameter,
    0, 0.05,
    createVector(0,0), 3, 0.1
  )

  ship.bowProp = 0.7 // Proportion of diameter
  ship.aftProp = 1 - ship.bowProp

  ship.weaponCd = 200
  ship.weaponLastFired = 0

  ship.sensor = Sensor(ship, nSensorRays)
  ship.scanRes = []

  /**
   * Use sensors to scan for the given objects
   * @param {Array} objs Array of SpaceObjects
   */
  ship.scan = objs => ship.sensor.scan(objs)

  /**
   * Fire laser when off cooldown
   */
  ship.shoot = () => {
    const now = millis()
    if(now - ship.weaponLastFired > ship.weaponCd) {
      ship.weaponLastFired = now
      return true
    }
    return false
  }

  /**
   * Draws the ship
   * @param {Boolean} showThruster 
   * @param {Boolean} showSensor 
   */
  ship.draw = (showThruster, showSensor) => {
    const l = ship.diameter*ship.bowProp
    const w = ship.diameter*ship.aftProp

    applyMatrix(cos(ship.rotation), sin(ship.rotation), -sin(ship.rotation), cos(ship.rotation), ship.pos.x, ship.pos.y)
    fill(255)
    stroke(255)
    triangle(l, 0, -w, -w, -w, w)
    if (showThruster && math.random() > 0.1) triangle(-l, 0, -w, -w/2, -w, w/2)
    resetMatrix()

    if (showSensor) ship.sensor.draw()
  }

  return ship
}