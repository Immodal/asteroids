Controls = () => {
  const cs = DemoBase()

  const init = () => {
    cs.viewDiv = cs.makeDiv("#main", "")

    cs.infoDiv = cs.makeDiv(cs.viewDiv, "Information")
    cs.generationLabel = cs.makeDataLabel(cs.infoDiv, "Generation #: ", "0")
    cs.nSpeciesLabel = cs.makeDataLabel(cs.infoDiv, "N Species: ", "0")
    cs.avgGenomeDistLabel = cs.makeDataLabel(cs.infoDiv, "Avg Genome Dist: ", "0")
    cs.lastGenAvgScoreLabel = cs.makeDataLabel(cs.infoDiv, "Last Gen Avg Score: ", "0")
    cs.lastGenTopScoreLabel = cs.makeDataLabel(cs.infoDiv, "Last Gen Top Score: ", "0")
    cs.gameRemLabel = cs.makeDataLabel(cs.infoDiv, "Current Game: ", "0")
    cs.scoreLabel = cs.makeDataLabel(cs.infoDiv, "Score: ", "0")

    cs.ctrlDiv = cs.makeDiv(cs.viewDiv, "Controls")
    const [slider, label] = cs.makeSliderGroup2(cs.ctrlDiv, "Skip Generations: ", 0, 100, 0, 1)
    cs.skipGenSlider = slider
    cs.skipGenLabel = label
    return cs
  }

  cs.getSkips = () => cs.skipGenSlider.value()
  cs.decSkips = () => {
    cs.skipGenSlider.value(cs.getSkips()>0 ? cs.getSkips()-1 : 0)
    cs.skipGenLabel.html(cs.skipGenSlider.value())
  }

  cs.updateInfo = (currentGame, population) => {
    cs.generationLabel.html(population.generation)
    cs.nSpeciesLabel.html(population.species.length)
    cs.avgGenomeDistLabel.html(population.avgGenomeDist[population.avgGenomeDist.length-1].toFixed(4))
    cs.lastGenAvgScoreLabel.html(population.avgScores[population.avgScores.length-1])
    cs.lastGenTopScoreLabel.html(population.topScores[population.topScores.length-1])
    cs.gameRemLabel.html(`${currentGame}/${population.members.length}`)
    cs.scoreLabel.html(population.members[currentGame].score)
  }

  return init()
}