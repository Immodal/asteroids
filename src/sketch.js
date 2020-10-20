let controls, games, canvas, chart;
let currentGame = 0
let replayMember = null
const N_SENSOR_LINES = 16
const N_SHIP_DATA_INPUTS = 7
const N_INPUTS = N_SENSOR_LINES + N_SHIP_DATA_INPUTS
const N_OUTPUTS = 4
const POP_SIZE = 100

/**
 * Setup
 */
function setup() {
  canvas = createCanvas(800, 480)
  canvas.parent("#cv")

  games = Population(POP_SIZE, N_INPUTS, N_OUTPUTS)
  
  fitnessChart = new Chart(
    document.getElementById('chartcv1').getContext('2d'), 
    {
      type: 'line',
      data: {
        labels: games.genMeta.generations,
        datasets:[{
          label: "Top Fitness",
          data: games.genMeta.topFitnesses,
          borderColor: "rgba(0, 255, 0, 0.5)",
          fill: false
        }, {
          label: "Average Fitness",
          data: games.genMeta.avgFitnesses,
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
        labels: games.genMeta.generations,
        datasets:[{
          label: "Top Score",
          data: games.genMeta.topScores,
          borderColor: "rgba(0, 255, 0, 0.5)",
          fill: false
        }, {
          label: "Average Score",
          data: games.genMeta.avgScores,
          borderColor: "rgba(0, 0, 255, 0.5)",
          fill: false
        }],
      },
    }
  )

  controls = Controls(fitnessChart, scoreChart, games, updatePopSize, changeNRays, getReplay, stopReplay)
}

/**
 * Draw
 */
function draw() {
  background(0)
  if (replayMember==null) {
    const game = games.members[currentGame]
    //game.actions()
    if (controls.getSkips() > 0) while(!game.over) game.update()
    else game.update()
    game.draw(controls.showRayCastingCb.checked(), controls.showNNCb.checked())
  
    if(game.over) currentGame += 1
    if(currentGame == games.members.length) {
      games.naturalSelection()
      controls.updateGeneration(games)
      currentGame = 0
      controls.decSkips()
    }
    controls.updateInfo(currentGame, games)
  } else {
    const game = replayMember
    game.update()
    // Canvas Replay Text
    textSize(32)
    fill(0, 255, 255)
    stroke(0)
    text('REPLAY', width/2, height/2);
    // Draw
    game.draw(controls.showRayCastingCb.checked(), controls.showNNCb.checked())
  
    if(game.over) stopReplay()
    else controls.updateReplayInfo(games, replayMember)
  }
}

/**
 * Change the number of rays that each ship casts out and then reset the simulation.
 */
function changeNRays() {
  stopReplay()
  games = Population(parseInt(controls.popSizeInput.value()), parseInt(controls.nRaysInput.value())+N_SHIP_DATA_INPUTS, N_OUTPUTS)
  currentGame = 0
  controls.fitnessChart.data.labels = games.genMeta.generations
  controls.fitnessChart.data.datasets[0].data = games.genMeta.topFitnesses
  controls.fitnessChart.data.datasets[1].data = games.genMeta.avgFitnesses
  controls.scoreChart.data.labels = games.genMeta.generations
  controls.scoreChart.data.datasets[0].data = games.genMeta.topScores
  controls.scoreChart.data.datasets[1].data = games.genMeta.avgScores
  controls.updateInfo(currentGame, games)
  controls.updateGeneration(games)
}

/**
 * Callback for setting up to run replayMember
 */
function getReplay() {
  if (controls.replayGenSelect.value()!="") { // Prevent errors when pressed when there is no data yet
    const genInd = games.genMeta.generations.indexOf(parseInt(controls.replayGenSelect.value()))
    const rType = controls.replayTypeRadio.value()
  
    const m = rType==controls.STR_TOP_SCORE ? games.topScoringMembers[genInd] : games.topFittestMembers[genInd]
    const g = games.getGenome(m).clone()
    replayMember = games.createMember(g, m.seed)
    replayMember.index = genInd
  }
}

/**
 * Callback for ending a replay session
 */
function stopReplay() {
  replayMember = null
  controls.updateInfo(currentGame, games)
}

  /**
   * Verify input value and then update population size
   */
function updatePopSize() {
  controls.updateNumberInput(controls.POP_SIZE_MIN, controls.POP_SIZE_MAX, controls.POP_SIZE_DEFAULT, true, false)(controls.popSizeInput)
  games.size = parseInt(controls.popSizeInput.value())
}