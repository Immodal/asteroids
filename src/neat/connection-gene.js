/**
 * Used in Genome to represent connection between Nodes
 */
ConnectionGene = (from, to, weight, innovation) => {
  const cg = {}

  cg.from = from
  cg.to = to
  cg.weight = weight
  cg.enabled = true
  cg.innovation = innovation

  /**
   * Mutate the weight of this connection
   */
  cg.mutate = () => {
    // 10% Chance for random weight override
    if (random()<0.1) cg.weight = random(-1, 1)
    else { // Otherwise random perturbation
      cg.weight += randomGaussian(0, 0.1)
      cg.weight = cg.weight > 1 ? 1 : cg.weight < -1 ? -1 : cg.weight
    }
  }

  /**
   * Create a clone of this connection.
   * @param {NodeGene} fn 
   * @param {NodeGene} tn 
   */
  cg.clone = (fn, tn) => {
    const cgc = ConnectionGene(fn, tn, cg.weight, cg.innovation)
    cgc.enabled = cg.enabled
    return cgc
  }

  return cg
}