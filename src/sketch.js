let controls, games, canvas;
const N_SENSOR_LINES = 32
const N_SHIP_DATA_INPUTS = 3
const N_INPUTS = N_SENSOR_LINES + N_SHIP_DATA_INPUTS
const N_OUTPUTS = 4
const POP_SIZE = 10

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

  let allComplete = true
  let drawn = false
  games.members.forEach((g,i) => {
    if (!g.over) {
      allComplete = false
      g.update()
      if (!drawn) {
        drawn = true
        g.draw()
      }
    }
  })

  if(allComplete) games.naturalSelection()
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
    let allComplete = true
    games.members.forEach(g => {
      if (!g.over) {
        allComplete = false
        g.update()
      }
    })

    if(allComplete) {
      console.log(`Generation ${games.generation} Complete. ${(startGen + nGen) - games.generation} Remaining. Time: ${new Date().toUTCString()}`)
      games.naturalSelection()
      console.log(`Starting Generation ${games.generation}. Time: ${new Date().toUTCString()}`)
    }
  }
}