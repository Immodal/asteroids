let game, canvas;

function setup() {
  canvas = createCanvas(500, 500)
  canvas.parent("#cv")

  game = Game()
}
    
function draw() {
  background(0)
  game.actions()
  game.draw()
}