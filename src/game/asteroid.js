
Asteroid = (x, y, velocity=null, size=2) => {
  let ast = {}

  /**
   * Initialize values
   */
  const init = () => {
    const MAX_SPEEDS = [1.5, 1, 0.5]
    const SIZES = [20, 40, 80]

    // Create random velocity vector
    if (velocity==null) {
      velocity = createVector(random(-1, 1), random(-1, 1))
      velocity.normalize()
      velocity.mult(MAX_SPEEDS[size])
    }
    // Create a parent object
    parent = SpaceObject(
      x, y, SIZES[size],
      0, 0.05,
      velocity, MAX_SPEEDS[size], 0
    )
    // Merge parent object into ast
    ast = Object.assign(parent, ast)
    ast.size = size

    return ast
  }

  /**
   * Breaks this asteroid into 3 smaller ones unless already at the smallest size
   */
  ast.breakUp = () => {
    if (ast.size==0) return []
    else {
      const vs = Array.from(Array(3), () => ast.velocity.copy())
      vs[1].rotate(-0.3)
      vs[2].rotate(0.5)
      return vs.map((v) => Asteroid(ast.pos.x, ast.pos.y, v, ast.size-1))
    }
  }

  /**
   * Draw this asteroid
   */
  ast.draw = () => {
    applyMatrix(cos(ast.rotation), sin(ast.rotation), -sin(ast.rotation), cos(ast.rotation), ast.pos.x, ast.pos.y)
    fill(0)
    stroke(255)
    circle(0, 0, ast.diameter)
    resetMatrix()
  }

  return init()
}