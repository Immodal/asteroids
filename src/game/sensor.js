Sensor = (ship, nRays=16) => {
  const sensor = {}
  sensor.ship = ship
  sensor.nRays = nRays
  sensor.results = []

  /**
   * Reformat results for use in neural network
   */
  sensor.getResults = () => {
    if(sensor.results.length==0) return Array.from(Array(nRays), () => [0])
    return sensor.results
      .map(res => res.intersections.reduce((acc, pt) => {
        const pDist = pt.dist(sensor.ship.pos)
        return pDist < acc[0] ? [pDist] : acc
      }, [width*10]))
  }

  /**
   * Perform ray casting to find the given objects and save the results
   * @param {Array} objs Array of SpaceObjects
   */
  sensor.scan = objs => {
    sensor.results = []
    for (let i=0; i<nRays; i++) {
      let p2 = p5.Vector.fromAngle(sensor.ship.rotation + i*TWO_PI/nRays, width).add(sensor.ship.pos)
      let intersections = []
      for (let j=0; j<objs.length; j++) {
        intersections.push(...sensor.cast(sensor.ship.pos, p2, objs[j]))
      }
      sensor.results.push({"ray": p2, "intersections": intersections})
    }
  }

  /**
   * Check for intersections between the object and the ray
   * @param {p5.Vector} p1 Ray origin
   * @param {p5.Vector} p2 Ray end
   * @param {SpaceObject} obj Object
   */
  sensor.cast = (p1, p2, obj) => {
    return sensor.lineCircle(p1, p2, obj.pos, obj.diameter/2)
      .filter(p => sensor.inBetween(p1, p2, p))
  }

  /**
   * Draw results for sensor.scan
   */
  sensor.draw = () => {
    for (let i=0; i<sensor.results.length; i++) {
      const ray = sensor.results[i].ray
      const intersections = sensor.results[i].intersections
      if (intersections.length>0) {
        let closest = intersections.reduce((acc, pt) => pt.dist(sensor.ship.pos) < acc.dist(sensor.ship.pos) ? pt : acc)
        line(sensor.ship.pos.x, sensor.ship.pos.y, closest.x, closest.y)
      } else {
        line(sensor.ship.pos.x, sensor.ship.pos.y, ray.x, ray.y)
      }
    }
  }

  /**
   * Line - Circle Intersection
   * https://stackoverflow.com/questions/57891494/how-to-calculate-intersection-point-of-a-line-on-a-circle-using-p5-js
   * @param {p5.Vector} p1 Point 1 on Line
   * @param {p5.Vector} p2 Point 2 on Line
   * @param {p5.Vector} cpt Center point of circle
   * @param {Float} r Radius of Circle
   */
  sensor.lineCircle = (p1, p2, cpt, r) => {
    let sign = function(x) { return x < 0.0 ? -1 : 1; }

    let x1 = p1.copy().sub(cpt)
    let x2 = p2.copy().sub(cpt)

    let dv = x2.copy().sub(x1)
    let dr = dv.mag()
    let D = x1.x*x2.y - x2.x*x1.y

    // evaluate if there is an intersection
    let di = r*r*dr*dr - D*D
    if (di < 0.0) return []

    let t = sqrt(di)

    ip = []
    ip.push( new p5.Vector(D*dv.y + sign(dv.y)*dv.x * t, -D*dv.x + abs(dv.y) * t).div(dr*dr).add(cpt) )
    if (di > 0.0) {
      ip.push( new p5.Vector(D*dv.y - sign(dv.y)*dv.x * t, -D*dv.x - abs(dv.y) * t).div(dr*dr).add(cpt) )
    }
    return ip
  }

  /**
   * Checks if a point is on a line
   * @param {p5.Vector} p1 Point 1 on Line
   * @param {p5.Vector} p2 Point 2 on Line
   * @param {p5.Vector} px Point to check
   */
  sensor.inBetween = (p1, p2, px) => {
      let v = p2.copy().sub(p1)
      let d = v.mag()
      v = v.normalize()
  
      let vx = px.copy().sub(p1)
      let dx = v.dot(vx)
  
      return dx >= 0 && dx <= d
  }

  return sensor
}