Controls = (fitnessChart, scoreChart, population,
   popSizeCallback, nRaysCallback, fullyConnectedCallback, 
   lifetimeMultCallback, scoreMultCallback, weightMutCallback, newConCallback, newNodeCallback,
   replayCallback, stopReplayCallback) => {
  const cs = DemoBase()

  /**
   * Initialize values
   */
  const init = () => {
    cs.STR_TOP_SCORE = 'Top Score'
    cs.STR_FITTEST = 'Fittest'
    cs.POP_SIZE_MIN = 10
    cs.POP_SIZE_MAX = 500
    cs.POP_SIZE_DEFAULT = population.size
    cs.POP_SIZE_STEP = 10

    cs.N_RAYS_MIN = 1
    cs.N_RAYS_MAX = 64
    cs.N_RAYS_DEFAULT = population.members[0].ship.ai.nInputs-N_SHIP_DATA_INPUTS
    cs.N_RAYS_STEP = 1

    cs.LIFETIME_MULT_DEFAULT = population.LIFETIME_MULTIPLIER
    cs.SCORE_MULT_DEFAULT = population.SCORE_MULTIPLIER

    cs.WEIGHT_MUT_DEFAULT = population.WEIGHT_MUTATION_RATE
    cs.WEIGHT_MUT_MIN = 0
    cs.WEIGHT_MUT_MAX = 1

    cs.NEW_CON_DEFAULT = population.NEW_CONNECTION_RATE
    cs.NEW_CON_MIN = 0
    cs.NEW_CON_MAX = 1

    cs.NEW_NODE_DEFAULT = population.NEW_NODE_RATE
    cs.NEW_NODE_MIN = 0
    cs.NEW_NODE_MAX = 1

    cs.fitnessChart = fitnessChart
    cs.scoreChart = scoreChart

    // Generation
    cs.generationLabel = cs.makeDataLabel("generationLbl", "Generation #: ", "0")
    cs.gameRemLabel = cs.makeDataLabel("gameLbl", "Current Game: ", "0")
    cs.scoreLabel = cs.makeDataLabel("scoreLbl", "Score: ", "0")
    let group = cs.makeSliderGroup3("Fast-forward Generations: ", "genSkipLbl", "genSkipInp", 0, 100, 0, 1)
    cs.skipGenSlider = group[0]
    cs.skipGenLabel = group[1]
    cs.nSpeciesLabel = cs.makeDataLabel("nSpeciesLbl", "Number of Species: ", "0")
    cs.compatThresholdLabel = cs.makeDataLabel("compatThreshLbl", "Compatibility Threshold: ", "3")
    cs.avgGenomeDistLabel = cs.makeDataLabel("genomeDistLbl", "Average Genome Difference: ", "0")
    
    // Settings
    cs.showNNCb = cs.makeCheckbox("showNNCb", "Show Neural Network", ()=>{}, value=true)
    cs.showRayCastingCb = cs.makeCheckbox("showRaysCb", "Show Ship Sensors", ()=>{}, value=true)
    cs.fullyConnectNNCb = cs.makeCheckbox("initiallyFullyConnectCb", "Initially fully connect networks (will cause RESET)", fullyConnectedCallback, value=true)
    
    group = cs.makeSliderGroup3("Population Size (More biodiversity, more games per generation): ", "popSizeLbl", "popSizeInp", 
      cs.POP_SIZE_MIN, cs.POP_SIZE_MAX, cs.POP_SIZE_DEFAULT, cs.POP_SIZE_STEP, 
      () => games.size = cs.popSizeSlider.value())
    cs.popSizeSlider = group[0]

    group = cs.makeSliderGroup3("Number of Sensors (will cause a RESET): ", "nRaysLbl", "nRaysInp", 
      cs.N_RAYS_MIN, cs.N_RAYS_MAX, cs.N_RAYS_DEFAULT, cs.N_RAYS_STEP, 
      nRaysCallback)
    cs.nRaysSlider = group[0]

    cs.lifetimeMultInput = cs.makeInputGroup("lifetimeMultInp", `Lifetime Multiplier (Fitness): `, cs.LIFETIME_MULT_DEFAULT, lifetimeMultCallback)
    cs.scoreMultInput = cs.makeInputGroup("scoreMultInp", `Score Multiplier (Fitness): `, cs.SCORE_MULT_DEFAULT, scoreMultCallback)
    cs.weightMutationInput = cs.makeInputGroup("weightMutInp", `Weight Mutation Rate [0,1]: `, cs.WEIGHT_MUT_DEFAULT, weightMutCallback)
    cs.newConnectionInput = cs.makeInputGroup("newConInp", `New Connection Rate [0,1]: `, cs.NEW_CON_DEFAULT, newConCallback)
    cs.newNodeInput = cs.makeInputGroup("newNodeInp", `New Node Rate [0,1]: `, cs.NEW_NODE_DEFAULT, newNodeCallback)

    // Replay
    cs.replayTypeRadio = cs.makeRadioGroup("replayTypeInp", [cs.STR_TOP_SCORE, cs.STR_FITTEST], 0)
    cs.replayGenSelectLabel = createP('Generation #: ')
    cs.replayGenSelectLabel.parent("replayGenInp")
    cs.makeReplayGenSelect(population)
    cs.replayBtn = cs.makeButton("replayGenPlayPauseInp", "Play", replayCallback)
    cs.stopReplayBtn = cs.makeButton("replayGenPlayPauseInp", "Stop", stopReplayCallback)
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
      if (gen>=0) cs.replayGenSelect.option(gen)
    })
    if (population.genMeta.generations.length>1) 
      cs.replayGenSelect.selected(population.genMeta.generations[population.genMeta.generations.length-1].toString())
  }

  return init()
}