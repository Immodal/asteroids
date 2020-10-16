let population, games, canvas;
let N_INPUTS = 16
let N_HIDDEN_NODES = 8
let N_HIDDEN_LAYERS = 2
let POP_SIZE = 20
let MUTATION_RATE = 0.05
let generationCount = 0

function setup() {
  canvas = createCanvas(1000, 500)
  canvas.parent("#cv")

  population = createPopulation(POP_SIZE)
  games = population.map(ai => Game(ai))
}
    
function draw() {
  background(0)
  //game.actions()

  let allComplete = true
  games.forEach(g => {
    if (!g.over) {
      allComplete = false
      g.draw()
    }

    fill(255)
    textSize(32);
    text(`Gen: ${generationCount}`, width-150, 30);
  })

  if(allComplete) {
    generationCount += 1
    population = mutatePopulation(population, games)
    games = population.map(ai => Game(ai))
  }
}

function createPopulation(size) {
  return Array.from(
    Array(size), 
    () => Neuroevolution.construct(N_INPUTS, N_HIDDEN_NODES, N_HIDDEN_LAYERS, 4)
  )
}

function mutatePopulation(pop, games) {
  const mAndC = (np, ai, ratio) => {
    for (let i=0; i<math.floor(POP_SIZE*ratio); i++) {
      if (i==0) np.push(ai)
      else np.push(ai.crossover(ranked[i][1]).mutate(MUTATION_RATE))
    }
  }

  let ranked = games.map((g, i) => [g.score, pop[i]])
  ranked.sort((a, b) => {
    return a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0
  })

  let newPop = []
  mAndC(newPop, ranked[0][1], 0.4)
  mAndC(newPop, ranked[1][1], 0.2)
  mAndC(newPop, ranked[2][1], 0.1)

  for (let i=0; i<POP_SIZE-newPop.length; i++) {
    newPop.push(Neuroevolution.construct(N_INPUTS, N_HIDDEN_NODES, N_HIDDEN_LAYERS, 4))
  }
  return newPop
}