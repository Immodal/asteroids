/**
 * Used in InnovationHistory for individual innovations
 */
InnovationEntry = (fromId, toId, innovation, genomeInnovations) => {
  const ie = {}

  /**
   * Initialize all values for the object
   */
  const init = () => {
    ie.fromId = fromId
    ie.toId = toId
    ie.innovation = innovation
    ie.genomeInnovations = genomeInnovations
    return ie
  }

  /**
   * Check if a potential connection would match this entry
   * @param {Integer} fId Id of From Node
   * @param {Integer} tId Id of To Node
   * @param {Array} gInnovations Innovation numbers the genome possesses
   */
  ie.matches = (fId, tId, gInnovations) => {
    // They should have the same genome, so num connections and innovation numbers should match
    if(gInnovations.length == ie.genomeInnovations.length) {
      if(fId == ie.fromId && tId == ie.toId) { // obviously nodes should match too
        for(let i=0; i<gInnovations.length; i++) {
          if (gInnovations[i] != ie.genomeInnovations[i]) return false
        }
        return true
      }
    }
    return false
  }

  return init()
}