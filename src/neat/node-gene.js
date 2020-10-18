/**
 * Node found in Genome
 */
NodeGene = (id, layer) => {
  const node = {}

  node.id = id
  node.layer = layer
  node.input = 0
  node.output = 0
  node.connections = []

  /**
   * Generate an output and add its weighted value to connected nodes
   */
  node.pulse = () => {
    // Activate only if not input layer node
    node.output = node.layer==0 ? node.input : node.sigmoid(node.input)
    // Add the output to the input of each connected node
    node.connections.forEach(con => con.to.input += con.enabled ? con.weight * node.output : 0)
  }

  /**
   * Activation function
   * @param {Float} x 
   */
  node.sigmoid = x => 1/(1+exp(-x))

  /**
   * Check if other is connected to this node
   * @param {NodeGene} other 
   */
  node.connectedTo = (other) => {
    if(node.layer == other.layer) return false
    else {
      const fn = other.layer < node.layer ? other : node
      const tn = other.layer < node.layer ? node : other
      for(let i=0; i<fn.connections.length; i++) {
        if(fn.connections[i].to==tn) return true
      }
    }
    return false
  }
  
  /**
   * Create a clone of this node.
   * Doesn't do a full clone because most will have to be overwritten
   */
  node.clone = () => NodeGene(node.id, node.layer)

  return node
}