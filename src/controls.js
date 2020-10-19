Controls = (fitnessChart, scoreChart) => {
  const cs = DemoBase()

  const init = () => {
    cs.fitnessChart = fitnessChart
    cs.scoreChart = scoreChart
    cs.viewDiv = cs.makeDiv("#main", "")

    cs.infoDiv = cs.makeDiv(cs.viewDiv, "Information")
    cs.generationLabel = cs.makeDataLabel(cs.infoDiv, "Generation #: ", "0")
    cs.nSpeciesLabel = cs.makeDataLabel(cs.infoDiv, "N Species: ", "0")
    cs.compatThresholdLabel = cs.makeDataLabel(cs.infoDiv, "Compatibility Threshold: ", "3")
    cs.avgGenomeDistLabel = cs.makeDataLabel(cs.infoDiv, "Avg Genome Dist: ", "0")
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
    cs.generationLabel.html(population.generations[population.generations.length-1])
    cs.nSpeciesLabel.html(population.species.length)
    cs.compatThresholdLabel.html(population.compatibilityThreshold.toFixed(4))
    cs.avgGenomeDistLabel.html(population.avgGenomeDist[population.avgGenomeDist.length-1].toFixed(4))
    cs.gameRemLabel.html(`${currentGame}/${population.members.length}`)
    cs.scoreLabel.html(population.members[currentGame].score)
  }

  cs.updateChart = (population) => {
    const _update = (ch, data, i) => {
      if (data.length>100) {
        cs.fitnessChart
        ch.data.datasets[i].data = data.slice(data.length-100)
      }
    }
    
    _update(cs.fitnessChart, population.topFitnesses, 0)
    _update(cs.fitnessChart, population.avgFitnesses, 1)
    _update(cs.scoreChart, population.topScores, 0)
    _update(cs.scoreChart, population.avgScores, 1)

    if (population.generations.length>100) {
      const gens = population.generations.slice(population.generations.length-100)
      cs.fitnessChart.data.labels = gens
      cs.scoreChart.data.labels = gens
    }

    cs.fitnessChart.update()
    cs.scoreChart.update()
  }

  return init()
}