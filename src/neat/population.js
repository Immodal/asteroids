Population = (size, nInputs, nOutputs) => {
  const pn = {}

  /**
   * Initialize all values for the object
   */
  const init = () => {
    pn.STALENESS_THRESHOLD = 15

    pn.generation = 0
    pn.innovationHistory = InnovationHistory(1000)
    pn.members = Array.from(Array(size), () => pn.createMember(Genome(nInputs, nOutputs, pn.innovationHistory)))
    pn.species = []
    return pn
  }

  /**
   * Takes a genome and creates a new Member
   * >> Override this for other applications <<
   * @param {Genome} genome 
   */
  pn.createMember = (genome) => Game(genome)

  /**
   * Calculates the fitness of a given member
   * >> Override this for other applications <<
   * @param {Game} member 
   */
  pn.calcFitness = (member) => {
    let score = member.score
    let hitRate = member.ship.shotCount>0 ? member.ship.shotHits / member.ship.shotCount : 0
    let lifespan = member.updateCount * 0.2 // Arbitrarily ratio
    return hitRate * (score + lifespan)
  }

  /**
   * Retrieve the Genome from the member
   * >> Override this for other applications <<
   * @param {Game} member 
   */
  pn.getGenome = (member) => member.ship.ai

  /**
   * Generate new members from the result of this generation
   */
  pn.naturalSelection = () => {
    // Clear species of their old members
    pn.species.forEach(s => s.members = [])
    // Sort current members into their species
    pn.members.forEach(m => {
      let speciesFound = false
      // Check existing species
      for(let i=0; i<pn.species.length; i++) {
        if(pn.species[i].isSameSpecies(pn.getGenome(m))) {
          pn.species[i].addMember(m)
          speciesFound = true
          break
        }
      }
      // Otherwise make new species
      if (!speciesFound) pn.species.push(Species(pn.getGenome, pn.calcFitness, m))
    })
    // Sort members of each species, cull losers and update species stats
    pn.species
      .forEach(s => {
        s.sortMembers()
        s.cull()
        s.sortMembers()
      })
    // Sort species by the fitness of their top member, remove stale species
    pn.species
      .sort((a, b) => a.bestFitness>b.bestFitness ? -1 : a.bestFitness<b.bestFitness ? 1 : 0)
      .filter((s, i) => i<2 || s.staleness<pn.STALENESS_THRESHOLD)
    // Reproduction
    const totalAvgFitness = pn.species.reduce((acc, s) => acc + s.avgFitness)
    const children = []
    pn.species.forEach(s => {
      const nChildren = floor(s.averageFitness / totalAvgFitness * pn.species.length)
      for (let i=0; i<nChildren; i++) { // Add Children to array
        // Clone top performer first
        if (i==0) children.push(pn.getGenome(s.members[0][s.MEMBER_IND]).clone())
        else children.push(s.getOffspring(pn.innovationHistory));
      }
    })
    // Fill remaining slots with children of top performer
    nFill = pn.members.length-children.length
    for (let i=0; i<nFill; i++) {
      const sp = pn.species[0]
      children.push(sp.getOffspring(pn.innovationHistory, sp.members[0][sp.MEMBER_IND]))
    }
    pn.members = children.map(gn => pn.createMember(gn))
    pn.generation += 1
  }
  
  return init()
}