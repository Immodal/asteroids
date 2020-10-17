Population = (nInputs, nOutputs, size) => {
  const pn = {}

  /**
   * Initialize all values for the object
   */
  constructor = () => {
    pn.generation = 0
    pn.members = Array.from(Array(size), () => Game(Genome(nInputs, nOutputs)))
    return pn
  }

  /**
   * Calculates the fitness of a given member
   * @param {Game} member 
   */
  pn.calcFitness = (member) => {
    let score = member.score
    let hitRate = member.ship.shotCount>0 ? member.ship.shotHits / member.ship.shotCount : 0
    let lifespan = member.updateCount * 0.2 // Arbitrarily ratio
    return hitRate * (score + lifespan)
  }

  
  return constructor()
}