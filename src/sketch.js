let controls, games, canvas;
let currentGame = 0;
const N_SENSOR_LINES = 32
const N_SHIP_DATA_INPUTS = 3
const N_INPUTS = N_SENSOR_LINES + N_SHIP_DATA_INPUTS
const N_OUTPUTS = 4
const POP_SIZE = 50

function setup() {
  canvas = createCanvas(1000, 600)
  canvas.parent("#cv")

  games = Population(POP_SIZE, N_INPUTS, N_OUTPUTS)
  controls = Controls()
  controls.init(skipForward)
}

/**
 * Draw
 */
function draw() {
  background(0)
  //game.actions()
  const game = games.members[currentGame]
  game.update()
  game.draw()

  if(game.over) currentGame += 1
  if(currentGame == games.members.length) {
    games.naturalSelection()
    currentGame = 0
  }
  controls.updateInfo(games)
}

/**
 * Skip forward a number of generations as fast as possible
 * @param {Integer} nGen 
 */
function skipForward(nGen) {
  console.log(`Skipping ${nGen} Generations starting at ${games.generation}. Time: ${new Date().toUTCString()}`)
  const startGen = games.generation
  while (games.generation<startGen + nGen) {
    const game = games.members[currentGame]
    game.update()
  
    if(game.over) currentGame += 1
    if(currentGame == games.members.length) {
      console.log(`Generation ${games.generation} Complete. ${(startGen + nGen) - games.generation} Remaining. Time: ${new Date().toUTCString()}`)
      games.naturalSelection()
      currentGame = 0
      console.log(`Starting Generation ${games.generation}. Time: ${new Date().toUTCString()}`)
    }
  }
}