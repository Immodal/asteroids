Controls = () => {
  const cs = DemoBase()

  cs.init = (skipGenCallback) => {
    cs.viewDiv = cs.makeDiv("#main", "")

    cs.infoDiv = cs.makeDiv(cs.viewDiv, "Information")
    cs.generationLabel = cs.makeDataLabel(cs.infoDiv, "Generation #: ", "0")
    cs.drawIndLabel = cs.makeDataLabel(cs.infoDiv, "Current Watching Game #: ", "0")
    cs.gameRemLabel = cs.makeDataLabel(cs.infoDiv, "Games remaining: ", "0")

    cs.ctrlDiv = cs.makeDiv(cs.viewDiv, "Controls")
    cs.skipGenInput = cs.makeInputGroup(cs.ctrlDiv, "Skip Generations [1, 20]: ", 1, cs.updateSkipGenInput(skipGenCallback))
  }

  cs.updateSkipGenInput = skipGenCallback => () => {
    cs.updateNumberInput(1, 20, 1, true, false)(cs.skipGenInput)
    skipGenCallback(parseInt(cs.skipGenInput.value()))
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

  return cs
}