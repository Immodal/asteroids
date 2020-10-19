/**
 * Genome based on NEAT
 */
Genome = (nInputs=null, nOutputs=null, innoHist=null, 
    initiallyFullyConnect=true, weightMutationRate=0.8, newConnectionRate=0.05, newNodeRate=0.01) => {
  const gn = {}

  /**
   * Initialize all values for the object
   */
  const init = () => {
    // If not all params are supplied, the constructor will assume this is used for cloning and not run
    if (nInputs==null || nOutputs==null || innoHist==null) return gn
    gn.weightMutationRate = weightMutationRate
    gn.newConnectionRate = newConnectionRate
    gn.newNodeRate = newNodeRate

    gn.nInputs = nInputs
    gn.nOutputs = nOutputs
    gn.nextNodeNum = 0 // For node number to use. Crossovers can cause this to desync from nodes.length
    gn.nLayers = 2 // Always start with 2 layers, input and output
    gn.BIAS_IND = 0 // Bias Node will always be at index 0
    
    // Create bias, input and output nodes
    // TODO Possibly support starting with a totally unconnected network
    gn.nodes = Array.from(
      Utils.range(1+gn.nInputs+gn.nOutputs),
      i => NodeGene(gn.nextNodeNum++, i>=gn.nInputs+1 ? 1 : 0)
    )
    // Connect all bias/inputs directly to all outputs
    // The bare minimum amount of connections with random weights and unique innovation numbers
    gn.connections = []
    // Fully connect, otherwise add a random mutation to start off
    if (initiallyFullyConnect) {
      for(let i=0; i<gn.nInputs+1; i++) {
        for(let j=0; j<gn.nOutputs; j++) {
          const innovation = innoHist.add(gn.nodes[i].id, gn.nodes[gn.nInputs+1+j])
          const connection = ConnectionGene(gn.nodes[i], gn.nodes[gn.nInputs+1+j], random(-1, 1), innovation)
          gn.connections.push(connection)
        }
      }
    } else gn.mutate(innoHist)

    // Init network list
    gn.generateNetwork()
    return gn
  }

  /**
   * Update the network list
   */
  gn.generateNetwork = () => {
    gn.refreshConnections()
    // List of nodes ordered by layer for to maintain the correct pulse order
    gn.network = gn.nodes.slice()
    gn.network.sort((a, b) => a.layer > b.layer ? 1 : a.layer < b.layer ? -1 : 0)
  }

  /**
   * Ensure that each node maintains the correct connection genes
   */
  gn.refreshConnections = () => {
    // TODO Possible to optimize Genome to not need this method?
    gn.nodes.forEach(n => n.connections = [])
    gn.connections.forEach(c => c.from.connections.push(c))
  }

  /**
   * Crossover this genome with another. Assumes this is the fitter genome.
   * @param {Genome} other 
   */
  gn.crossover = (other) => {
    // find connection in other with matching innovation number
    const findMatch = (innovation) => {
      for(let i=0; i<other.connections.length; i++) {
        if(other.connections[i].id==innovation) return other.connections[i]
      }
      return null
    }
    
    // Inherit Genes, prioritizing this, the fittest parent
    const childConnections = []
    const isEnabled = []
    for (let i=0; i<gn.connections.length; i++) {
      let setEnabled = true
      let otherConnection = findMatch(gn.connections[i].innovation)
      if (otherConnection!=null) {
        // If disabled in either parent, 75% chance of being disabled in child
        if ((!gn.connections[i].enabled || !otherConnection.enabled) && random() < 0.75) {
          setEnabled = false
        }
        // 50% chance to inherit from either parent
        childConnections.push(random()<0.5 ? gn.connections[i] : otherConnection) 
      } else {
        // Inherit all excess and disjoint from this
        childConnections.push(gn.connections[i]) 
        setEnabled = gn.connections[i].enabled
      }
      isEnabled.push(setEnabled)
    }

    // Since all excess and disjoint genes are inherited from the fitter parent (this), the child's structure is the same as this parent.
    // So we can clone all the nodes from this parent
    const child = gn.clone(true)
    child.nodes = gn.nodes.map(n => n.clone())
    child.connections = childConnections.map((c, i) => {
      const cc = c.clone(child.getNode(c.from.id), child.getNode(c.to.id))
      cc.enabled = isEnabled[i]
      return cc
    })
    child.generateNetwork()

    return child
  }

  /**
   * Mutate this genome
   * @param {InnovationHistory} iHist 
   */
  gn.mutate = (iHist) => {
    const rand = random()
    if (gn.connections.length == 0) gn.addConnection(iHist)
    if (rand<gn.weightMutationRate) gn.connections.forEach(c => c.mutate())
    if (rand<gn.newConnectionRate) gn.addConnection(iHist)
    if (rand<gn.newNodeRate) gn.addNode(iHist)
  }

  /**
   * Get the node with a given id
   * @param {Integer} id 
   */
  gn.getNode = (id) => {
    for(let i=0; i<gn.nodes.length; i++) {
      if(gn.nodes[i].id==id) return gn.nodes[i]
    }
  }

  /**
   * Insert a new Node between two random nodes with an existing connection
   * @param {InnovationHistory} iHist 
   * @param {Boolean} fullyConnectedBias
   */
  gn.addNode = (iHist, fullyConnectedBias=true) => {
    // Pick a random connection excluding from Bias nodes
    let connection = Utils.pickRandom(gn.connections)
    if (fullyConnectedBias) {
      while(connection.from == gn.nodes[gn.BIAS_IND]) {
        connection = Utils.pickRandom(gn.connections)
      }
    }

    // Disable node
    connection.enabled = false
    // Create new node to insert
    const newNode = NodeGene(gn.nextNodeNum++, connection.from.layer+1)
    // Connect to newNode with weight of 1
    const innovation1 = iHist.add(connection.from.id, newNode.id)
    gn.connections.push(ConnectionGene(connection.from, newNode, 1, innovation1))
    // Connect newNode to the "to" node of the disabled connection
    const innovation2 = iHist.add(newNode.id, connection.to.id)
    gn.connections.push(ConnectionGene(newNode, connection.to, connection.weight, innovation2))
    // Connect bias node to newNode with weight of 0
    if (fullyConnectedBias) {
      const innovation3 = iHist.add(gn.nodes[gn.BIAS_IND].id, newNode.id)
      gn.connections.push(ConnectionGene(gn.nodes[gn.BIAS_IND], newNode, 0, innovation3))
    }
    // If layer of newNode is equal to "to" layer, increment the layer number of all nodes that are
    // greater than or equal to newNode.layer, as well as genome layer count
    if (newNode.layer == connection.to.layer) {
      gn.nodes.forEach(n => { if (n.layer>=newNode.layer) n.layer += 1 })
      gn.nLayers += 1
    }
    gn.nodes.push(newNode)
    gn.generateNetwork()
  }

  /**
   * Connect two random unconnected nodes
   * @param {InnovationHistory} iHist 
   */
  gn.addConnection = (iHist) => {
    if (gn.isFullyConnected()) return null
    // Get Random Nodes
    // TODO Optimize
    let n1 = Utils.pickRandom(gn.nodes)
    let n2 = Utils.pickRandom(gn.nodes)
    while (n1.layer == n2.layer || n1.connectedTo(n2)) {
      //get new ones
      n1 = Utils.pickRandom(gn.nodes)
      n2 = Utils.pickRandom(gn.nodes)
    }
    // Make sure the node with the earliest layer is n1
    if (n1.layer>n2.layer) {
      let temp = n1
      n1 = n2
      n2 = temp
    }

    const innovation = iHist.add(n1.id, n2.id)
    gn.connections.push(ConnectionGene(n1, n2, random(-1, 1), innovation))
    gn.refreshConnections()
  }

  /**
   * Checks if the genome is fully connected
   */
  gn.isFullyConnected = () => {
    // Store number of nodes per layer
    let nNodesInLayer = Array(gn.nLayers).fill(0)
    gn.nodes.forEach(n => nNodesInLayer[n.layer] += 1)

    // A node can only connect to layers higher than it
    let maxConnections = 0
    for (let i=0; i<gn.nLayers-1; i++) {
      // Count number of nodes that this layer can be connected to
      const nodesInFront = nNodesInLayer.slice(i+1).reduce((acc, n)=> acc+n)
      // Calculate connections if all nodes this layer are fully connected
      maxConnections += nNodesInLayer[i] * nodesInFront
    }
    // If the number of connections is equal to the max number of connections possible then it is full
    return maxConnections <= gn.connections.length
  }

  /**
   * Feed inputs through the NN to receive its outputs
   * @param {Array} inputs 1D array of inputs
   */
  gn.feedForward = (inputs) => {
    // Set input values into the input nodes
    gn.nodes[gn.BIAS_IND].input = 1
    for(let i=1; i<gn.nInputs; i++) {
      gn.nodes[i].input = inputs[i-1]
    }
    // Pulse through network in order, to generate outputs
    gn.network.forEach(n => n.pulse())
    // 
    let outputs = []
    for (let i=0; i<gn.nOutputs; i++) {
      outputs.push(gn.nodes[1+gn.nInputs+i].output)
    }
    // Reset all nodes
    gn.nodes.forEach(n => n.input=0)
    return outputs
  }

  /**
   * Create a deep copy of this genome
   */
  gn.clone = (partial=false) => {
    const gnc = Genome()
    gnc.weightMutationRate = gn.weightMutationRate
    gnc.newConnectionRate = gn.newConnectionRate
    gnc.newNodeRate = gn.newNodeRate

    gnc.nInputs = gn.nInputs
    gnc.nOutputs = gn.nOutputs
    gnc.nextNodeNum = gn.nextNodeNum
    gnc.nLayers = gn.nLayers
    gnc.BIAS_IND = gn.BIAS_IND

    if (partial) {
      gnc.nodes = []
      gnc.connections = []
      gnc.network = []
    } else {
      // Clone nodes and then use them when cloning connections
      gnc.nodes = gn.nodes.map(n => n.clone())
      gnc.connections = gn.connections.map(c => c.clone(gnc.getNode(c.from.id), gnc.getNode(c.to.id)))
      gnc.generateNetwork()
    }
    return gnc
  }

  gn.draw = (x, y, w, h) => {
    // Split nodes into layers
    const layered = []
    let layer = -1
    for (let i=0; i<gn.network.length; i++) {
      if (gn.network[i].layer>layer) {
        layer += 1
        layered.push([])
      }
      layered[layer].push(gn.network[i])
    }

    // Generate node positions and extract ids
    const nodePos = []
    const nodeIds = []
    for (let i=0; i<layered.length; i++) {
      const nx = x + w*0.05 + (w*0.9*i/(layered.length-1))
      for (let j=0; j<layered[i].length; j++) {
        let ny = null
        if (layered[i].length==1) ny = height/2
        else ny = y + h*0.05 + (h*0.9*j/(layered[i].length-1))
        nodePos.push(createVector(nx, ny))
        nodeIds.push(layered[i][j].id)
      }
    }

    // Draw Connection Lines
    stroke(255)
    fill("rgba(0,0,0,0.5)")
    rect(x, y, w, h)
    for (let i=0; i<gn.connections.length; i++) {
      const c = gn.connections[i]
      if (!c.enabled) stroke(50, 50, 200)
      else if (c.weight<0) stroke(map(c.weight, -1, 0, 50, 255, true), 50, 50) 
      else stroke(50, map(c.weight, 0, 1, 50, 255, true), 50) 
      const from = nodePos[nodeIds.indexOf(c.from.id)]
      const to = nodePos[nodeIds.indexOf(c.to.id)]
      line(from.x, from.y, to.x, to.y)
    }

    // Draw Nodes
    for (let i=0; i<nodePos.length; i++) {
      fill(255)
      stroke(0)
      strokeWeight(1)
      circle(nodePos[i].x, nodePos[i].y, 20, 20);
      textSize(10)
      fill(0)
      textAlign(CENTER, CENTER)
      text(nodeIds[i], nodePos[i].x, nodePos[i].y);
    }
  }

  return init()
}