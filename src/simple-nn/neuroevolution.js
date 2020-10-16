Activations = {
  sigmoid: x => 1/(1+math.exp(-x)),

  // Derivative (y = sigmoid(x))
  dSigmoid: y => y * (1 - y),
}

/**
 * Neuroevolution Module
 */
Neuroevolution = {
  /**
   * This converts array to a 1xN matrix, and then transposes it to a Nx1: [1, 2, 3] -> [[1], [2], [3]]
   * @param {Array} array 1D Array of inputs
   */
  arrayToInput: array => math.transpose([array]),

  /**
   * Converts an instance of Neural Network to JSON
   * @param {NeuralNetwork} nn Instance of Neural Network
   */
  serialize: nn => JSON.stringify(nn),

  /**
   * Converts a data object or JSON string into a Neural Network
   * @param {*} data Object or JSON string
   */
  deserialize: data => {
    if (typeof data == 'string') data = JSON.parse(data)
    let nn = Neuroevolution.construct(
      data.ihWeights[0].length, 
      data.ihWeights.length, 
      data.hhWeights.length+1,
      data.hoWeights.length,
      data.activation, data.dactivation)
    nn.generation = data.generation
    nn.ihWeights = data.ihWeights
    nn.ihBias = data.ihBias
    nn.hhWeights = data.hhWeights
    nn.hhBias = data.hhBias
    nn.hoWeights = data.hoWeights
    nn.hoBias = data.hoBias
    return nn;
  },

  /**
   * Neuroevolution Instance Constructor
   */
  construct: (
    nInputs, nHidden, nHiddenLayers, nOutputs, 
    activation=Activations.sigmoid, dactivation=Activations.dSigmoid) => {
    const ne = {}
    ne.generation=0

    ne.activation = activation
    ne.dactivation = dactivation

    // Number of columns in a matrix is equivalent to the number of inputs into the layer
    // Number of rows is equivalent to the number of nodes in the layer
    ne.ihWeights = math.random([nHidden, nInputs], -1, 1)
    ne.ihBias = math.ones([nHidden,1])
    
    ne.hhWeights = math.random([nHiddenLayers-1, nHidden, nHidden], -1, 1)
    ne.hhBias = math.ones([nHiddenLayers-1, nHidden, 1])

    ne.hoWeights = math.random([nOutputs, nHidden], -1, 1)
    ne.hoBias = math.ones([nOutputs,1])

    /**
     * Get a prediction based on the current state of the network
     * @param {Array} input
     */
    ne.predict = input => {
      // Output of input through first hidden layer
      const ihOut = ne.feedForward(input, ne.ihWeights, ne.ihBias)
      
      // Output of all other hidden layers
      let hhOut = null
      if(ne.hhWeights.length==0) {
        hhOut = ihOut
      } else {
        hhOut = ne.hhWeights.reduce((acc, weights, i)=> ne.feedForward(acc, weights, ne.hhBias[i]), ihOut)
      }

      // Output of hidden layer through output layer
      return ne.feedForward(hhOut, ne.hoWeights, ne.hoBias)
    }

    /**
     * Feed the input forward through a layer
     * @param {Array} input Matrix of outputs from the previous layer
     * @param {Array} weights Matrix of weights for the layer
     * @param {Array} bias Matrix of bias for the layer
     */
    ne.feedForward = (input, weights, bias) => {
      // Calculate weighted value of inputs for all 
      const weighted = math.multiply(weights, input)
      // Add bias to weighted values
      const biased = math.add(weighted, bias)
      // Run each node output through activation function
      return biased.map(row => row.map(ne.activation))
    }

    /**
     * Create a clone of this network and mutate according to mutationRate
     * @param {Float} mutationRate 
     */
    ne.mutate = (mutationRate=0.01, mutationSD=0.1) => {
      const mu = node => node.map(w => 
        math.random()<mutationRate ? 
          math.random()<0.1 ? // Chance to completely change rather than nudge
            math.random(-1, 1) : w + randomGaussian(0, mutationSD) :
          w)
      let nec = Neuroevolution.construct(
        ne.ihWeights[0].length, 
        ne.ihWeights.length, 
        ne.hhWeights.length+1,
        ne.hoWeights.length,
        ne.activation, ne.dactivation)
      nec.generation = ne.generation + 1
      nec.ihWeights = ne.ihWeights.map(mu)
      nec.ihBias = ne.ihBias.map(mu)
      nec.hhWeights = ne.hhWeights.map(layer => layer.map(mu))
      nec.hhBias = ne.hhBias.map(layer => layer.map(mu))
      nec.hoWeights = ne.hoWeights.map(mu)
      nec.hoBias = ne.hoBias.map(mu)
      return nec
    }

    return ne
  }
}