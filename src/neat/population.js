Population = (speciesSize, nInputs, nOutputs) => {
  const pn = {}

  /**
   * Initialize all values for the object
   */
  const init = () => {
    pn.STALENESS_THRESHOLD = 15
    pn.MAGIC_NO = 987654321987654

    pn.generation = 0
    pn.speciesSize = speciesSize
    pn.innovationHistory = InnovationHistory(1000)
    pn.memberSeed = random(pn.MAGIC_NO)
    pn.members = Array.from(Array(pn.speciesSize), () => pn.createMember(Genome(nInputs, nOutputs, pn.innovationHistory), pn.memberSeed))
    pn.avgScores = [0]
    pn.topScores = [0]
    pn.avgGenomeDist = [0]
    pn.species = []
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
    let score = member.score
    let hitRate = member.ship.shotCount>0 ? member.ship.shotHits / member.ship.shotCount : 0
    let lifespan = member.updateCount // Arbitrarily ratio
    return score + lifespan*0.05 + hitRate*100
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
    pn.avgScores.push(pn.members.reduce((acc, m) => acc + m.score, 0)/pn.members.length)
    pn.topScores.push(pn.members.reduce((acc, m) => acc > m.score ? acc : m.score, 0))
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
      if (!speciesFound) pn.species.push(Species(pn.getGenome, pn.calcFitness, m))
    })
    pn.avgGenomeDist.push(dists.reduce((acc, d) => acc + d, 0)/dists.length)
    // Sort members of each species, cull losers and update species stats
    pn.species
      .forEach(s => {
        s.sortMembers()
        s.cull()
        s.sortMembers()
      })
    // Sort species by the fitness of their top member, remove stale species
    pn.species = pn.species
      .sort((a, b) => a.bestFitness>b.bestFitness ? -1 : a.bestFitness<b.bestFitness ? 1 : 0)
      .filter((s, i) => (i==0 && s.members.length>0) || s.staleness<pn.STALENESS_THRESHOLD)
    // Reproduction
    const children = []
    pn.species.forEach(s => {
      // TODO Gradually reduce size based on staleness instead?
      for (let i=0; i<pn.speciesSize; i++) { // Add Children to array
        // Clone top performer first
        if (i==0) children.push(pn.getGenome(s.members[0][s.MEMBER_IND]).clone())
        else children.push(s.getOffspring(pn.innovationHistory));
      }
    })

    pn.memberSeed = random(pn.MAGIC_NO)
    pn.members = children.map(gn => pn.createMember(gn, pn.memberSeed))
    pn.generation += 1
  }
  
  return init()
}