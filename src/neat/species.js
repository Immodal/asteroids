Species = (id, getGenome, calcFitness, member, compatibilityThreshold=3, excessAndDisjointCoeff=1, weightDiffCoeff=0.5) => {
  const sp = {}

  const init = () => {
    sp.id = id
    sp.compatibilityThreshold = compatibilityThreshold
    sp.excessAndDisjointCoeff = excessAndDisjointCoeff
    sp.weightDiffCoeff = weightDiffCoeff

    sp.FITNESS_IND = 0
    sp.MEMBER_IND = 1

    sp.members = []
    sp.rep = null
    sp.repFitness = 0
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
  sp.getOffspring = (iHist) => {
    let child = null
    if (random()<0.25) { // 25% Chance to be a clone
      child = sp.getGenome(sp.members[sp.getRandomMemberInd()][sp.MEMBER_IND]).clone()
    } else { // 75% chance of crossover
      let p1Tup = sp.members[sp.getRandomMemberInd()]
      let p2Tup = sp.members[sp.getRandomMemberInd()]
      if (p1Tup[sp.FITNESS_IND] < p2Tup[sp.FITNESS_IND]) {
        child = sp.getGenome(p2Tup[sp.MEMBER_IND]).crossover(sp.getGenome(p1Tup[sp.MEMBER_IND]))
      } else {
        child = sp.getGenome(p1Tup[sp.MEMBER_IND]).crossover(sp.getGenome(p2Tup[sp.MEMBER_IND]))
      }
    }

    child.mutate(iHist)
    return child
  }

  /**
   * Get random member index weighted by fitness
   */
  sp.getRandomMemberInd = () => {
    const rand = random()
    // 50% chance to take from top 25% of members
    if(rand<0.5) return Utils.randomInt(0, floor(sp.members.length*0.25))
    // 25% chance to take from top 25% - 50% of members
    else if(rand<0.75) return Utils.randomInt(floor(sp.members.length*0.25), floor(sp.members.length*0.5))
    // 25% chance to take from bottom 50% of members
    else return Utils.randomInt(floor(sp.members.length*0.5), sp.members.length)
  }

  /**
   * Sort members by fitness
   */
  sp.sortMembers = () => {
    sp.members = sp.members
      // Calculate fitness adjusted for size of species
      .map(tup => [sp.calcFitness(tup[sp.MEMBER_IND])/sp.members.length, tup[sp.MEMBER_IND]])
      .sort((a, b) => a[sp.FITNESS_IND] < b[sp.FITNESS_IND] ? 1 : a[sp.FITNESS_IND] > b[sp.FITNESS_IND] ? -1 : 0)
    sp._updateStats()
  }

  /**
   * Update internal stats
   */
  sp._updateStats = () => {
    if (sp.members.length==0) {
      sp.staleness = 200 // Arbitrary
    } else {
      sp.bestFitness = sp.members[0][sp.FITNESS_IND]*sp.members.length
      sp.avgFitness = sp.members.reduce((acc, tup) => acc+tup[sp.FITNESS_IND], 0)/sp.members.length
      if (sp.bestFitness >= sp.repFitness) { // New top dog
        sp.repFitness = sp.bestFitness
        sp.staleness = 0
        sp.rep = sp.getGenome(sp.members[0][sp.MEMBER_IND]).clone()
      } else sp.staleness += 1
    }
  }

  /**
   * Check if a Genome is similar enough to the representative to be in this species
   * @param {Genome} other
   * @param {Boolean} retDist Instead of returning a boolean, return an Array [iss, dist]
   */
  sp.isSameSpecies = (other, retDist=false) => {
    const dist = sp.dist(other, sp.rep)
    const iss = dist < sp.compatibilityThreshold
    return retDist ? [iss, dist] : iss
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