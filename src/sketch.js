let controls, games, canvas;
let currentGame = 0
const N_SENSOR_LINES = 32
const N_SHIP_DATA_INPUTS = 5
const N_INPUTS = N_SENSOR_LINES + N_SHIP_DATA_INPUTS
const N_OUTPUTS = 4
const POP_SIZE = 100

function setup() {
  canvas = createCanvas(1000, 600)
  canvas.parent("#cv")

  games = Population(POP_SIZE, N_INPUTS, N_OUTPUTS)
  controls = Controls()
}

/**
 * Draw
 */
function draw() {
  background(0)
  const game = games.members[currentGame]
  //game.actions()
  if (controls.getSkips() > 0) while(!game.over) game.update()
  else game.update()
  game.draw()

  if(game.over) currentGame += 1
  if(currentGame == games.members.length) {
    games.naturalSelection()
    currentGame = 0
    controls.decSkips()
  }
  controls.updateInfo(currentGame, games)
}