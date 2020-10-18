Controls = () => {
  const cs = DemoBase()

  const init = () => {
    cs.viewDiv = cs.makeDiv("#main", "")

    cs.infoDiv = cs.makeDiv(cs.viewDiv, "Information")
    cs.generationLabel = cs.makeDataLabel(cs.infoDiv, "Generation #: ", "0")
    cs.gameRemLabel = cs.makeDataLabel(cs.infoDiv, "Current Game: ", "0")

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
    cs.gameRemLabel.html(`${currentGame}/${population.members.length}`)
  }

  return init()
}