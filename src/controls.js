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

    cs.N_RAYS_MIN = 1
    cs.N_RAYS_MAX = 64
    cs.N_RAYS_DEFAULT = population.members[0].ship.ai.nInputs-N_SHIP_DATA_INPUTS

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
    cs.viewDiv = cs.makeDiv("#main", "")

    // Information
    cs.infoDiv = cs.makeDiv(cs.viewDiv, "Information")
    cs.infoDiv.size(340, 460)
    cs.generationLabel = cs.makeDataLabel(cs.infoDiv, "Generation #: ", "0")
    cs.gameRemLabel = cs.makeDataLabel(cs.infoDiv, "Current Game: ", "0")
    cs.scoreLabel = cs.makeDataLabel(cs.infoDiv, "Score: ", "0")
    cs.infoInfoLabel1 = createP(
      "The number of generations effectively means the number of times the population was able to reproduce and evolve. " +
      "A higher number typically (but not always) means a smarter neural network. ")
    cs.infoInfoLabel1.parent(cs.infoDiv)
    cs.infoInfoLabel2 = createP(
      "The networks are categorized into species which help protect innovative mutations and give them time to reach their full potential. " +
      "They are separated by the Compatibility Threshold which I have modified to adapt to the state of the population, helping to maintain between 3 and 20 species. ")
    cs.infoInfoLabel2.parent(cs.infoDiv)
    cs.nSpeciesLabel = cs.makeDataLabel(cs.infoDiv, "N Species: ", "0")
    cs.compatThresholdLabel = cs.makeDataLabel(cs.infoDiv, "Compatibility Threshold: ", "3")
    cs.avgGenomeDistLabel = cs.makeDataLabel(cs.infoDiv, "Avg Genome Dist: ", "0")

    // Controls
    cs.ctrlDiv = cs.makeDiv("#main", "Controls")
    cs.ctrlDiv.size(325, 460)
    cs.ctrlsInfoLabel1 = createP(
      "Here we can control a few aspects of the simulation. " + 
      "You can use the Fast-forward Generations slider skip past the boring bits as the networks take a few generations to get smart. ")
    cs.ctrlsInfoLabel1.parent(cs.ctrlDiv)
    cs.ctrlsInfoLabel2 = createP(
      "Increasing population size increases biodiversity and can help the networks evolve faster. " + 
      "Increasing the number of rays will effectively give the ship more \"eyes\" to see with. ")
    cs.ctrlsInfoLabel2.parent(cs.ctrlDiv)
    const [slider, label] = cs.makeSliderGroup2(cs.ctrlDiv, "Fast-forward Generations: ", 0, 100, 0, 1)
    cs.skipGenSlider = slider
    cs.skipGenLabel = label
    cs.popSizeInput = cs.makeInputGroup(cs.ctrlDiv, `Population Size [${cs.POP_SIZE_MIN},${cs.POP_SIZE_MAX}]: `, cs.POP_SIZE_DEFAULT, popSizeCallback)
    cs.nRaysInput = cs.makeInputGroup(cs.ctrlDiv, `N Rays (RESET) [${cs.N_RAYS_MIN},${cs.N_RAYS_MAX}]: `, cs.N_RAYS_DEFAULT, nRaysCallback)
    cs.fullyConnectNNCb = cs.makeCheckbox(cs.ctrlDiv, "Initially fully connect networks (RESET)", fullyConnectedCallback, value=true)
    cs.showNNCb = cs.makeCheckbox(cs.ctrlDiv, "Show Neural Network", callback=()=>{}, value=true)
    cs.showRayCastingCb = cs.makeCheckbox(cs.ctrlDiv, "Show Ray Casting", callback=()=>{}, value=true)

    // More Controls
    cs.controlsAndreplayDiv = cs.makeDiv("#main", "")
    cs.controlsAndreplayDiv.size(300, 460)
    cs.moreControlsDiv = cs.makeDiv(cs.controlsAndreplayDiv, "More Controls")
    cs.lifetimeMultInput = cs.makeInputGroup(cs.moreControlsDiv, `Lifetime Multiplier (Fitness): `, cs.LIFETIME_MULT_DEFAULT, lifetimeMultCallback)
    cs.scoreMultInput = cs.makeInputGroup(cs.moreControlsDiv, `Score Multiplier (Fitness): `, cs.SCORE_MULT_DEFAULT, scoreMultCallback)
    cs.weightMutationInput = cs.makeInputGroup(cs.moreControlsDiv, `Weight Mutation Rate [0,1]: `, cs.WEIGHT_MUT_DEFAULT, weightMutCallback)
    cs.newConnectionInput = cs.makeInputGroup(cs.moreControlsDiv, `New Connection Rate [0,1]: `, cs.NEW_CON_DEFAULT, newConCallback)
    cs.newNodeInput = cs.makeInputGroup(cs.moreControlsDiv, `New Node Rate [0,1]: `, cs.NEW_NODE_DEFAULT, newNodeCallback)

    // Replay
    cs.replayDiv = cs.makeDiv(cs.controlsAndreplayDiv, "Replays")
    cs.replayInfoLabel1 = createP(
      "Use this replay feature to observe the behaviour of the top performing networks for each generation.")
    cs.replayInfoLabel1.parent(cs.replayDiv)
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