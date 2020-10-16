NodeGene = (id, layer) => {
  const node = {}

  node.id = id
  node.layer = layer
  node.input = 0
  node.output = 0
  node.connections = []

  node.pulse = () => {
    node.output = node.layer==0 ? node.input : node.sigmoid(node.input)
    node.connections.forEach(con => con.to.input += con.enabled ? con.weight * node.output : 0)
  }

  node.sigmoid = x => 1/(1+math.exp(-x))

  return node
}