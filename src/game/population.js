Population = (size, nIn, nHidden, nHiddenLayers, nOutputs) => {
  const np = {}
  np.generation = 0
  np.nIn = nIn
  np.nHidden = nHidden
  np.nHiddenLayers = nHiddenLayers
  np.nOutputs = nOutputs
  np.data = Array.from(
    Array(size), 
    () => Game(Neuroevolution.construct(nIn, nHidden, nHiddenLayers, nOutputs))
  )

  /**
   * Rank each game by network fitness
   */
  np.rank = () => {
    let maxScore = np.data.reduce((acc,g) => g.score>acc ? g.score : acc, 1)
    let maxLife = np.data.reduce((acc,g) => g.stopTime>acc ? g.stopTime : acc, 1)
    let ranked = np.data.map(g => [g.score/maxScore*0.6 + g.stopTime/maxLife*0.4, g])
    ranked.sort((a, b) => {
      return a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0
    })
    np.data = ranked.map(tup => tup[1])
  },

  /**
   * Use the top performers to generate a new population
   */
  np.mutate = () => {
    const m = (arr, game, ratio) => {
      for (let i=0; i<np.data.length*ratio; i++) {
        if (i==0) arr.push(Game(game.ship.ai))
        else arr.push(Game(game.ship.ai.mutate()))
      }
    }
  
    const fillEmpty = (arr) => {
      const nRandom = np.data.length-arr.length
      for (let i=0; i<nRandom; i++) {
        arr.push(Game(Neuroevolution.construct(np.nIn, np.nHidden, np.nHiddenLayers, np.nOutputs)))
      }
    }

    newData = []
    np.rank()
    m(newData, np.data[0], 0.25)
    m(newData, np.data[1], 0.25)
    m(newData, np.data[2], 0.15)
    m(newData, np.data[3], 0.15)
    m(newData, np.data[4], 0.15)
    fillEmpty(newData)

    np.generation += 1
    np.data = newData
  }

  return np
}