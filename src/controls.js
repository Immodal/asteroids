Controls = () => {
  const cs = DemoBase()

  const init = () => {
    cs.viewDiv = cs.makeDiv("#main", "")

    cs.infoDiv = cs.makeDiv(cs.viewDiv, "Information")
    cs.generationLabel = cs.makeDataLabel(cs.infoDiv, "Generation #: ", "0")
    cs.drawIndLabel = cs.makeDataLabel(cs.infoDiv, "Current Watching Game #: ", "0")
    cs.gameRemLabel = cs.makeDataLabel(cs.infoDiv, "Games remaining: ", "0")

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

  cs.updateInfo = population => {
    cs.generationLabel.html(population.generation)
    let drawInd = -1
    let gmCount = 0
    for(let i=0; i<population.members.length; i++) {
      if (!population.members[i].over) {
        gmCount += 1
        if (drawInd<0) drawInd = i
      }
    }
    cs.drawIndLabel.html(drawInd)
    cs.gameRemLabel.html(`${gmCount}/${population.members.length}`)
  }

  return init()
}