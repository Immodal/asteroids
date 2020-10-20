Controls = (fitnessChart, scoreChart, population, popSizeCallback, nRaysCallback, replayCallback, stopReplayCallback) => {
  const cs = DemoBase()

  /**
   * Initialize values
   */
  const init = () => {
    cs.STR_TOP_SCORE = 'Top Score'
    cs.STR_FITTEST = 'Fittest'
    cs.POP_SIZE_MIN = 10
    cs.POP_SIZE_MAX = 500
    cs.POP_SIZE_DEFAULT = 100

    cs.N_RAYS_MIN = 1
    cs.N_RAYS_MAX = 64
    cs.N_RAYS_DEFAULT = 16

    cs.fitnessChart = fitnessChart
    cs.scoreChart = scoreChart
    cs.viewDiv = cs.makeDiv("#main", "")

    // Information
    cs.infoDiv = cs.makeDiv(cs.viewDiv, "Information")
    cs.generationLabel = cs.makeDataLabel(cs.infoDiv, "Generation #: ", "0")
    cs.nSpeciesLabel = cs.makeDataLabel(cs.infoDiv, "N Species: ", "0")
    cs.compatThresholdLabel = cs.makeDataLabel(cs.infoDiv, "Compatibility Threshold: ", "3")
    cs.avgGenomeDistLabel = cs.makeDataLabel(cs.infoDiv, "Avg Genome Dist: ", "0")
    cs.gameRemLabel = cs.makeDataLabel(cs.infoDiv, "Current Game: ", "0")
    cs.scoreLabel = cs.makeDataLabel(cs.infoDiv, "Score: ", "0")

    // Controls
    cs.ctrlDiv = cs.makeDiv(cs.viewDiv, "Controls")
    cs.popSizeInput = cs.makeInputGroup(cs.ctrlDiv, `Population Size [${cs.POP_SIZE_MIN},${cs.POP_SIZE_MAX}]: `, cs.POP_SIZE_DEFAULT, popSizeCallback)
    cs.nRaysInput = cs.makeInputGroup(cs.ctrlDiv, `N Rays (will cause RESET) [${cs.N_RAYS_MIN},${cs.N_RAYS_MAX}]: `, cs.N_RAYS_DEFAULT, nRaysCallback)
    const [slider, label] = cs.makeSliderGroup2(cs.ctrlDiv, "Skip Generations: ", 0, 100, 0, 1)
    cs.skipGenSlider = slider
    cs.skipGenLabel = label
    cs.showNNCb = cs.makeCheckbox(cs.ctrlDiv, "Show Neural Network", callback=()=>{}, value=true)
    cs.showRayCastingCb = cs.makeCheckbox(cs.ctrlDiv, "Show Ray Casting", callback=()=>{}, value=true)

    // Replay
    cs.replayDiv = cs.makeDiv("#main", "Replays")
    cs.replayTypeRadio = cs.makeRadioGroup(cs.replayDiv, 'Type: ', [cs.STR_TOP_SCORE, cs.STR_FITTEST], 0)
    cs.replayGenSelectLabel = createP('Generation: ')
    cs.replayGenSelectLabel.parent(cs.replayDiv)
    cs.makeReplayGenSelect(population)
    cs.replayBtn = cs.makeButton(cs.replayDiv, "Play", replayCallback)
    cs.stopReplayBtn = cs.makeButton(cs.replayDiv, "Stop", stopReplayCallback)
    return cs
  }

  /**
   * To allow the sketch to easily interact with the slider
   */
  cs.getSkips = () => {
    if(parseInt(cs.skipGenSlider.value())>=100) cs.skipGenLabel.html("Endless")
    return cs.skipGenSlider.value()
  }
  cs.decSkips = () => {
    const val = parseInt(cs.skipGenSlider.value())
    cs.skipGenSlider.value(val>=100 ? 100 : cs.getSkips()>0 ? cs.getSkips()-1 : 0)
    cs.skipGenLabel.html(val>=100 ? "Endless" : cs.skipGenSlider.value())
  }

  /**
   * Update on-screen information, to be called after every update
   * @param {Integer} currentGame 
   * @param {Population} population 
   */
  cs.updateInfo = (currentGame, population) => {
    cs.generationLabel.html(population.genMeta.generations[population.genMeta.generations.length-1]+1)
    cs.nSpeciesLabel.html(population.species.length)
    cs.compatThresholdLabel.html(population.compatibilityThreshold.toFixed(4))
    cs.avgGenomeDistLabel.html(population.genMeta.avgGenomeDist[population.genMeta.avgGenomeDist.length-1].toFixed(4))
    cs.gameRemLabel.html(`${currentGame}/${population.members.length}`)
    cs.scoreLabel.html(population.members[currentGame].score)
  }

  /**
   * Update on-screen information while viewing a replay
   * @param {Population} population 
   * @param {Game} game 
   */
  cs.updateReplayInfo = (population, game) => {
    cs.generationLabel.html(population.genMeta.generations[game.index])
    cs.nSpeciesLabel.html("N/A")
    cs.compatThresholdLabel.html("N/A")
    cs.avgGenomeDistLabel.html(population.genMeta.avgGenomeDist[game.index].toFixed(4))
    cs.gameRemLabel.html("Replay")
    cs.scoreLabel.html(game.score)
  }

  /**
   * Update Charts etc, to be called after every generation
   * @param {Population} population 
   */
  cs.updateGeneration = (population) => {
    cs.fitnessChart.update()
    cs.scoreChart.update()
    cs.replayGenSelect.remove()
    cs.makeReplayGenSelect(population)
  }

  /**
   * Creates a new selection dropdown in cs.replayGenSelectLabel with updated generations
   * @param {Population} population 
   */
  cs.makeReplayGenSelect = (population) => {
    cs.replayGenSelect = createSelect()
    cs.replayGenSelect.parent(cs.replayGenSelectLabel)
    population.genMeta.generations.forEach(gen => {
      if (gen>0) cs.replayGenSelect.option(gen)
    })
    if (population.genMeta.generations.length>1) 
      cs.replayGenSelect.selected(population.genMeta.generations[population.genMeta.generations.length-1].toString())
  }

  return init()
}