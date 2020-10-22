/**
 * This is where the population of Genomes live.
 * Ideally only this class needs to be updated for each new application
 */
Population = (size, nInputs, nOutputs, initiallyFullyConnect=true) => {
  const pn = {}

  /**
   * Initialize all values for the object
   */
  const init = () => {
    // Upper Limit for generating random seeds for Games
    pn.MAGIC_NO = 987654321987654
    // Number of generations only a single species exists before 
    // decrementing pn.compatibilityThreshold to increase biodiversity
    pn.autoAdjCompatThreshold = true
    pn.DOMINATION_LIMIT = 2
    pn.DOMINATING_SPEC_LOW = 3
    pn.DOMINATION_ADJ_STEP = 0.1
    pn.dominationCounter = 0
    // Limit number of species
    pn.SPECIES_LIMIT = 20
    pn.SPECIES_ADJ_STEP = 0.1
    // Species Constants
    pn.STALENESS_THRESHOLD = 15
    pn.compatibilityThreshold = 3
    pn.EXCESS_AND_DISJOJINT_COEFF = 1
    pn.WEIGHT_DIFF_COEFF = 0.5
    // Genome Constants
    pn.initiallyFullyConnect = initiallyFullyConnect
    pn.WEIGHT_MUTATION_RATE = 0.8
    pn.NEW_CONNECTION_RATE = 0.05
    pn.NEW_NODE_RATE = 0.03
    // Fitness
    pn.LIFETIME_MULTIPLIER = 0.5
    pn.SCORE_MULTIPLIER = 2

    pn.nextSpeciesId = 0
    pn.size = size
    pn.innovationHistory = InnovationHistory(1000)
    pn.memberSeed = random(pn.MAGIC_NO)
    pn.members = Array.from(
      Array(pn.size), 
      () => pn.createMember(
        Genome(nInputs, nOutputs, pn.innovationHistory, 
          pn.initiallyFullyConnect, 
          pn.WEIGHT_MUTATION_RATE,
          pn.NEW_CONNECTION_RATE, 
          pn.NEW_NODE_RATE), 
        pn.memberSeed))
    pn.species = []
    pn.topScoringMembers = [null]
    pn.topFittestMembers = [null]
    pn.genMeta = {
      generations: [-1],
      topFitnesses: [0],
      avgFitnesses: [0],
      avgScores: [0],
      topScores: [0],
      avgGenomeDist: [0]
    }
    return pn
  }

  /**
   * Takes a genome and creates a new Member
   * >> Override this for other applications <<
   * @param {Genome} genome 
   * @param {Number} seed Random Seed
   */
  pn.createMember = (genome, seed) => Game(genome, seed)

  /**
   * Calculates the fitness of a given member
   * >> Override this for other applications <<
   * @param {Game} member 
   */
  pn.calcFitness = (member) => {
    let score = member.score * pn.SCORE_MULTIPLIER
    let lifespan = member.updateCount * pn.LIFETIME_MULTIPLIER
    // Extra incentive on a finished game
    let gameFinished = member.asteroids.length == 0 ? 2 : 1
    return (score + lifespan) * gameFinished
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
    randomSeed(null) // To prevent accidental patterns from emerging
    pn.genMeta.avgScores.push(pn.members.reduce((acc, m) => acc + m.score, 0)/pn.members.length)
    let topScoringMember = null
    pn.genMeta.topScores.push(pn.members.reduce((acc, m) => {
        if (topScoringMember==null || acc < m.score) {
          topScoringMember = m
          return m.score
        }
        return acc
      }, 0))
    pn.topScoringMembers.push(topScoringMember)
    // Clear species of their old members
    pn.species.forEach(s => s.members = [])
    // Sort current members into their species
    const dists = []
    pn.members.forEach(m => {
      let speciesFound = false
      // Check existing species
      for(let i=0; i<pn.species.length; i++) {
        const [iss, dist] = pn.species[i].isSameSpecies(pn.getGenome(m), true)
        dists.push(dist)
        if(iss) {
          pn.species[i].addMember(m)
          speciesFound = true
          break
        }
      }
      // Otherwise make new species
      if (!speciesFound) pn.species.push(
        Species(pn.nextSpeciesId++, pn.getGenome, pn.calcFitness, m, 
          pn.compatibilityThreshold, pn.EXCESS_AND_DISJOJINT_COEFF, pn.WEIGHT_DIFF_COEFF))
    })
    pn.genMeta.avgGenomeDist.push(dists.reduce((acc, d) => acc + d, 0)/dists.length)
    // Sort members of each species, cull losers and update species stats
    pn.species
      .forEach(s => {
        s.sortMembers()
        s.cull()
        s.sortMembers()
      })
    // Sort species by the fitness of their top member, remove stale species
    pn.species = pn.species
      // There is potential for the top member to get emptied because its members got 
      // grouped with another species, while at the same time both species are stale.
      // Thus, filtering out empty and stale species at the same time could result in no species remaining.
      .filter(s => s.members.length>0) 
      .sort((a, b) => a.bestFitness>b.bestFitness ? -1 : a.bestFitness<b.bestFitness ? 1 : 0)
      .filter((s, i) => i==0 || s.staleness<pn.STALENESS_THRESHOLD)
    // If there are too many species, there will be a mass extinction
    if (pn.species.length>pn.SPECIES_LIMIT*2) pn.species.length = pn.SPECIES_LIMIT*2
    // Reproduction
    const children = []
    const nChildren = floor(pn.size/pn.species.length)
    const remainder = max(0, pn.size - nChildren * pn.species.length)
    for (let i=0; i<pn.species.length; i++) {
      const s = pn.species[i]
      const adjNChildren = i==0 ? nChildren + remainder : nChildren
      // TODO Gradually reduce size based on staleness instead?
      for (let j=0; j<adjNChildren; j++) { // Add Children to array
        // Clone top performer first
        if (j==0) children.push(pn.getGenome(s.members[0][s.MEMBER_IND]).clone())
        else if (random()<0.001) { // 0.1% Chance to Crossover with another species
          const topCurrent = s.members[0]
          const s2 = Utils.pickRandom(pn.species)
          const topOther = s2.members[0]
          const g1 = pn.getGenome(topCurrent[s.MEMBER_IND])
          const g2 = pn.getGenome(topOther[s2.MEMBER_IND])
          if (topCurrent[s.FITNESS_IND]>topOther[s2.FITNESS_IND]) {
            children.push(g1.crossover(g2))
          } else {
            children.push(g2.crossover(g1))
          }
        } else children.push(s.getOffspring(pn.innovationHistory))
      }
    }

    // Adjust compatibility threshold
    if (pn.autoAdjCompatThreshold) {
      pn._checkDominationLimit()
      pn._checkSpeciesLimit()
    }

    pn.topFittestMembers.push(pn.species[0].members[0][pn.species[0].MEMBER_IND])
    pn.genMeta.topFitnesses.push(pn.species[0].bestFitness)
    pn.genMeta.avgFitnesses.push(pn.species.reduce((acc, s) => acc + s.avgFitness, 0)/pn.species.length)

    pn.memberSeed = random(pn.MAGIC_NO)
    pn.members = children.map(gn => pn.createMember(gn, pn.memberSeed))
    pn.genMeta.generations.push(pn.genMeta.generations[pn.genMeta.generations.length-1]+1)
    pn._trimGenMetaData()
  }

  /**
   * Check for species domination and update compatibilityThreshold accordingly
   */
  pn._checkDominationLimit = () => {
    if(pn.species.length>pn.DOMINATING_SPEC_LOW) pn.dominationCounter = 0
    else if (pn.dominationCounter<pn.DOMINATION_LIMIT) pn.dominationCounter+=1
    else if (pn.dominationCounter>=pn.DOMINATION_LIMIT) {
      pn.compatibilityThreshold *= 1 - pn.DOMINATION_ADJ_STEP
      pn.species.forEach(s => s.compatibilityThreshold = pn.compatibilityThreshold)
    }
  }

  /**
   * Check if there are too many species and update compatibilityThreshold accordingly
   */
  pn._checkSpeciesLimit = () => {
    if(pn.species.length>pn.SPECIES_LIMIT) {
      pn.compatibilityThreshold *= 1 + pn.SPECIES_ADJ_STEP
      pn.species.forEach(s => s.compatibilityThreshold = pn.compatibilityThreshold)
    }
  }

  /**
   * Limit the amount of Generation meta data stored
   */
  pn._trimGenMetaData = () => {
    const limit = 100
    if(pn.genMeta.generations.length>limit) {
      Object.values(pn.genMeta).forEach(arr => arr.shift())
    }
    if(pn.topScoringMembers.length>limit) pn.topScoringMembers.shift()
    if(pn.topFittestMembers.length>limit) pn.topFittestMembers.shift()
  }
  
  return init()
}