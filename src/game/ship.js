Ship = (x, y, diameter, ai=null) => {
  const ship = SpaceObject(
    x, y, diameter,
    0, 0.1,
    createVector(0,0), 3, 0.2
  )

  ship.bowProp = 0.7 // Proportion of diameter
  ship.aftProp = 1 - ship.bowProp

  ship.weaponCd = 200
  ship.weaponLastFired = 0
  ship.shotCount = 0
  ship.shotHits = 0

  ship.ai = ai
  ship.sensor = Sensor(ship, ship.ai==null ? 8 : ship.ai.nInputs-3)

  ship.takeActions = (currentTime, lasers) => {
    if (ship.ai!=null) {
      let data = ship.sensor.getResults()
      data.push(ship.rotation/TWO_PI)
      data.push(ship.pos.x/width)
      data.push(ship.pos.y/height)
      let actions = ship.ai.feedForward(data)
      
      if (actions[0]>0.5) ship.accelerate()
      if (actions[1]>0.5) ship.rotate(1)
      if (actions[2]>0.5) ship.rotate(-1)
      if (actions[3]>0.5 && ship.shoot()) lasers.push(Laser(currentTime, ship))
    }
  }

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
      ship.shotCount += 1
      return true
    }
    return false
  }

  /**
   * Draws the ship
   * @param {Boolean} showThruster 
   * @param {Boolean} showSensor 
   */
  ship.draw = (showSensor) => {
    const l = ship.diameter*ship.bowProp
    const w = ship.diameter*ship.aftProp
    if (showSensor) ship.sensor.draw()
    applyMatrix(cos(ship.rotation), sin(ship.rotation), -sin(ship.rotation), cos(ship.rotation), ship.pos.x, ship.pos.y)
    fill(255)
    stroke(255)
    triangle(l, 0, -w, -w, -w, w)
    if (ship.accelerated) {
      ship.accelerated = false
      if (math.random() > 0.05)triangle(-l, 0, -w, -w/2, -w, w/2)
    }
    resetMatrix()

    
  }

  return ship
}