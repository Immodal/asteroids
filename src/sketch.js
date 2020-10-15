let population, games, canvas;

function setup() {
  canvas = createCanvas(1000, 500)
  canvas.parent("#cv")

  population = createPopulation(10)
  games = population.map(ai => Game(ai))
}
    
function draw() {
  background(0)
  //game.actions()

  let allComplete = true
  games.forEach(g => {
    if (!g.over) allComplete = false
    g.draw()
  })

  if(allComplete) {
    games.forEach(g => console.log(g.score))
    noLoop()
  }
}

function createPopulation(size) {
  return Array.from(
    Array(size), 
    () => Neuroevolution.construct(16, 8, 2, 4)
  )
}