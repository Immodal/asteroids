Species = (member, getGenome, calcFitness) => {
  const sp = {}

  constructor = () => {
    sp.members = []
    sp.staleness = 0 // N Generations since improvement
    sp.MAX_STALENESS = 200

    sp.excessCoeff = excessCoeff
    sp.weightDiffCoeff = weightDiffCoeff
    sp.compatibilityThreshold = compatibilityThreshold

    sp.getGenome = getGenome
    sp.calcFitness = calcFitness
    sp.members.push(member)
    sp.bestFitness = sp.calcFitness(member)
    sp.avgFitness = sp.bestFitness
    sp.totalFitness = sp.bestFitness
    sp.rep = sp.getGenome(member).clone()
    return sp
  }

  /**
   * Get A Random Offspring of the species
   */
  sp.getRandomOffspring = () => {
    return sp.getGenome(math.pickRandom(sp.members)).clone().mutate()
    /*if (random(1) < 0.25) {
      baby = this.selectPlayer().clone();
    } else {
      //crossover
    }*/
  }

  /**
   * Sort members by fitness and update stats
   */
  sp.sortMembers = () => {
    const fitnesses = sp.members.map(m => sp.calcFitness(m))
    const ranked = sp.members.map((m, i) => [fitnesses[i], m]).sort((a, b) => {
      return a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0
    })

    sp.members = ranked.map(tup => tup[1])
    sp.avgFitness = ranked.reduce((acc, tup) => acc+tup[0], 0)/ranked.length
    if (ranked[0][0] > sp.bestFitness) { // New top dog
      sp.bestFitness = ranked[0][0]
      sp.staleness = 0
      sp.rep = ranked[0][1].clone()
    } else sp.staleness += 1
  }

  /**
   * Check if a Genome is similar enough to the representative to be in this species
   * @param {Genome} other
   */
  sp.isSameSpecies = (other) => {
    return sp.dist(other, sp.rep) < 3 // Compatibility Threshold
  }

  /**
   * Measure how similar two Genomes are to each other
   * @param {Genome} g1 
   * @param {Genome} g2 
   */
  sp.dist = (g1, g2) => {
    // TODO Update to match original paper calculations
    const excessAndDisjointCoeff = 1
    const weightDiffCoeff = 0.5
    const g1c = g1.connections
    const g2c = g2.connections
    let matches = 0
    let totalWeightDiff = 0
    for (let i=0; i<g1c.length; i++) {
      for (let j=0; j<g2c.length; j++) {
        if (g1c[i].innovation == g2c[j].innovation) {
          matches += 1
          totalWeightDiff += math.abs(g1c[i].weight - g2c[j].weight);
          break
        }
      }
    }
    // Non matches are either excess or disjoint
    const nExcessAndDisjoint = g1c.length + g2c.length - 2*matches
    const avgWeightDiff = matches==0 ? 100 : totalWeightDiff/matches
    const largeGenomeNormalizer = g1c.length < 20 && g2c.length < 20 ? 1 : math.max(g1c.length, g2c.length)
    return (excessAndDisjointCoeff * nExcessAndDisjoint / largeGenomeNormalizer) + (weightDiffCoeff * avgWeightDiff)
  }

  /**
   * Remove bottom half of species
   */
  sp.cull = () => {
    if (sp.members.length > 2) sp.members.length = math.ceil(sp.members.length/2)
  }

  return constructor()
}