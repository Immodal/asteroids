ConnectionGene = (from, to, weight, enabled, innovation) => {
  const cg = {}

  cg.from = from
  cg.to = to
  cg.weight = weight
  cg.enabled = enabled
  cg.innovation = innovation

  cg.mutate = () => {
    // 10% Chance for random weight change
    if (math.random()<0.1) cg.weight = math.random(-1, 1)
    else { // Otherwise random perturbation
      cg.weight += randomGaussian(0, 0.02)
      cg.weight = cg.weight > 1 ? 1 : cg.weight < -1 ? -1 : cg.weight
    }
  }

  return cg
}