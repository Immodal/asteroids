Species = (getGenome, calcFitness, member) => {
  const sp = {}

  const init = () => {
    sp.compatibilityThreshold = 1
    sp.excessAndDisjointCoeff = 1
    sp.weightDiffCoeff = 0.5

    sp.FITNESS_IND = 0
    sp.MEMBER_IND = 1

    sp.members = []
    sp.rep = null
    sp.bestFitness = 0
    sp.avgFitness = 0
    sp.staleness = 0 // N Generations since improvement

    sp.getGenome = getGenome
    sp.calcFitness = calcFitness
    sp.addMember(member)
    sp.sortMembers()
    return sp
  }

  /**
   * Add a member to this species
   * @param {*} m 
   */
  sp.addMember = (m) => {
    let tup = Array(2)
    tup[sp.FITNESS_IND] = 0
    tup[sp.MEMBER_IND] = m
    sp.members.push(tup)
  }

  /**
   * Get A Offspring of the species
   * @param {InnovationHistory} iHist
   */
  sp.getOffspring = (iHist, parent1=null) => {
    if (parent1==null) parent1 = Utils.pickRandom(sp.members)

    const os = sp.getGenome(parent1).clone()
    os.mutate(iHist)
    return os
    // TODO Crossover
    /*if (random(1) < 0.25) {
      baby = this.selectPlayer().clone();
    } else {
      //crossover
    }*/
  }

  /**
   * Sort members by fitness
   */
  sp.sortMembers = () => {
    sp.members = sp.members
      // Calculate fitness adjusted for size of species
      .map(tup => [sp.calcFitness(tup[sp.MEMBER_IND])/sp.members.length, tup[sp.MEMBER_IND]])
      .sort((a, b) => a[sp.FITNESS_IND] < b[sp.FITNESS_IND] ? 1 : a[sp.FITNESS_IND] > b[sp.FITNESS_IND] ? -1 : 0)
    sp.updateStats()
  }

  /**
   * Update internal stats
   */
  sp.updateStats = () => {
    if (sp.members.length==0) {
      sp.staleness = 200 // Arbitrary
    } else {
      sp.avgFitness = sp.members.reduce((acc, tup) => acc+tup[sp.FITNESS_IND], 0)/sp.members.length
      if (sp.members[0][sp.FITNESS_IND] >= sp.bestFitness) { // New top dog
        sp.bestFitness = sp.members[0][0]
        sp.staleness = 0
        sp.rep = sp.getGenome(sp.members[0][sp.MEMBER_IND]).clone()
      } else sp.staleness += 1
    }
  }

  /**
   * Check if a Genome is similar enough to the representative to be in this species
   * @param {Genome} other
   */
  sp.isSameSpecies = (other) => {
    return sp.dist(other, sp.rep) < sp.compatibilityThreshold // Compatibility Threshold
  }

  /**
   * Measure how similar two Genomes are to each other
   * @param {Genome} g1 
   * @param {Genome} g2 
   */
  sp.dist = (g1, g2) => {
    const g1c = g1.connections
    const g2c = g2.connections
    let matches = 0
    let totalWeightDiff = 0
    for (let i=0; i<g1c.length; i++) {
      for (let j=0; j<g2c.length; j++) {
        if (g1c[i].innovation == g2c[j].innovation) {
          matches += 1
          totalWeightDiff += abs(g1c[i].weight - g2c[j].weight);
          break
        }
      }
    }
    // Non matches are either excess or disjoint
    const nExcessAndDisjoint = g1c.length + g2c.length - 2*matches
    const avgWeightDiff = matches==0 ? 1000 : totalWeightDiff/matches
    const largeGenomeNormalizer = g1c.length < 20 && g2c.length < 20 ? 1 : max(g1c.length, g2c.length)
    return (sp.excessAndDisjointCoeff * nExcessAndDisjoint / largeGenomeNormalizer) + (sp.weightDiffCoeff * avgWeightDiff)
  }

  /**
   * Remove bottom half of species
   */
  sp.cull = () => {
    if (sp.members.length > 1) sp.members.length = ceil(sp.members.length/2)
  }

  return init()
}