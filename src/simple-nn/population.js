NeuroevolutionPopulation = (size, nInputs, nOutputs) => {
  const np = {}

  np.randomNetwork = () => {
    return Game(Neuroevolution.construct(
      nInputs, 
      math.randomInt(min(nOutputs, nInputs), max(nOutputs, nInputs)), 
      math.randomInt(1, 3), 
      nOutputs))
  }

  /**
   * Rank each game by network fitness
   */
  np.rank = () => {
    let maxScore = np.data.reduce((acc,g) => g.score>acc ? g.score : acc, 1)
    np.topScores.push(maxScore)
    //let maxLife = np.data.reduce((acc,g) => g.stopTime>acc ? g.stopTime : acc, 1)
    //np.topLives.push(maxLife)
    //let ranked = np.data.map(g => [g.score/maxScore*0.6 + g.stopTime/maxLife*0.3 + g.ship.velocity.mag()>0 ? 0.1: 0, g])
    let ranked = np.data.map(g => [g.score/maxScore, g])

    ranked.sort((a, b) => {
      return a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0
    })
    np.data = ranked.map(tup => tup[1])
  },

  /**
   * Use the top performers to generate a new population
   */
  np.mutate = (mutationRate, mutationSD) => {
    newData = []
    np.rank()

    for (let i=0; i<np.data.length*0.25; i++) {
      if (i==0) newData.push(Game(np.data[0].ship.ai))
      else newData.push(Game(np.data[0].ship.ai.mutate(mutationRate, mutationSD)))
    }

    for (let i=1; i<np.data.length*0.5; i++) {
      newData.push(Game(np.data[i].ship.ai.mutate(mutationRate, mutationSD)))
    }

    const nRandom = np.data.length-newData.length
    for (let i=0; i<nRandom; i++) {
      newData.push(np.randomNetwork())
    }

    np.generation += 1
    np.data = newData
  }

  np.generation = 0
  np.nInputs = nInputs
  np.nOutputs = nOutputs
  np.data = Array.from(
    Array(size), 
    () => np.randomNetwork()
  )
  np.topScores = []
  np.topLives = []

  return np
}