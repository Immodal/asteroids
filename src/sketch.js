let controls, games, canvas, chart;
let currentGame = 0
const N_SENSOR_LINES = 16
const N_SHIP_DATA_INPUTS = 7
const N_INPUTS = N_SENSOR_LINES + N_SHIP_DATA_INPUTS
const N_OUTPUTS = 4
const POP_SIZE = 10

function setup() {
  canvas = createCanvas(1000, 480)
  canvas.parent("#cv")

  games = Population(POP_SIZE, N_INPUTS, N_OUTPUTS)
  
  fitnessChart = new Chart(
    document.getElementById('chartcv1').getContext('2d'), 
    {
      type: 'line',
      data: {
        labels: games.generations,
        datasets:[{
          label: "Top Fitness",
          data: games.topFitnesses,
          borderColor: "rgba(0, 255, 0, 0.5)",
          fill: false
        }, {
          label: "Average Fitness",
          data: games.avgFitnesses,
          borderColor: "rgba(0, 0, 255, 0.5)",
          fill: false
        }],
      },
    }
  )

  scoreChart = new Chart(
    document.getElementById('chartcv2').getContext('2d'), 
    {
      type: 'line',
      data: {
        labels: games.generations,
        datasets:[{
          label: "Top Score",
          data: games.topScores,
          borderColor: "rgba(0, 255, 0, 0.5)",
          fill: false
        }, {
          label: "Average Score",
          data: games.avgScores,
          borderColor: "rgba(0, 0, 255, 0.5)",
          fill: false
        }],
      },
    }
  )

  controls = Controls(fitnessChart, scoreChart)
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
    controls.updateChart(games)
    currentGame = 0
    controls.decSkips()
  }
  controls.updateInfo(currentGame, games)
}