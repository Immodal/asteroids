
Asteroid = (x, y, size=2) => {
  let MAX_SPEED = 1.5
  let SIZES = [10, 30, 50]

  const ast = SpaceObject(
    x, y, SIZES[size],
    0, 0.05,
    p5.Vector.mult(p5.Vector.random2D(), MAX_SPEED), MAX_SPEED, 0
  )

  ast.size = size

  /**
   * Breaks this asteroid into 3 smaller ones unless already at the smallest size
   */
  ast.breakUp = () => {
    if (ast.size==0) return []
    else return Array.from(Array(3), () => Asteroid(ast.pos.x, ast.pos.y, ast.size-1))
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

  return ast
}