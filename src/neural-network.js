Activations = {
  sigmoid: x => 1/(1+math.exp(-x)),

  // Derivative (y = sigmoid(x))
  dSigmoid: y => y * (1 - y),
}

/**
 * Neural Network Module
 */
NeuralNetwork = {
  /**
   * This converts array to a 1xN matrix, and then transposes it to a Nx1: [1, 2, 3] -> [[1], [2], [3]]
   * @param {Array} array 1D Array of inputs
   */
  arrayToInput: array => math.transpose([array]),

  /**
   * Converts an instance of NeuralNetwork to JSON
   * @param {NeuralNetwork} nn Instance of NeuralNetwork
   */
  serialize: nn => JSON.stringify(nn),

  /**
   * Converts a data object or JSON string into a NeuralNetwork
   * @param {*} data Object or JSON string
   */
  deserialize: data => {
    if (typeof data == 'string') data = JSON.parse(data)
    let nn = NeuralNetwork.construct(
      data.ihWeights[0].length, 
      data.ihWeights.length, 
      data.hhWeights.length+1,
      data.hoWeights.length,
      data.lr,
      data.activation, data.dactivation)
    nn.ihWeights = data.ihWeights
    nn.ihBias = data.ihBias
    nn.hhWeights = data.hhWeights
    nn.hhBias = data.hhBias
    nn.hoWeights = data.hoWeights
    nn.hoBias = data.hoBias
    return nn;
  },

  /**
   * Neural Network Instance Constructor
   */
  construct: (
    nInputs, nHidden, nHiddenLayers, nOutputs, 
    learningRate=0.1,
    activation=Activations.sigmoid, dactivation=Activations.dSigmoid) => {
    const nn = {}

    nn.lr = learningRate

    nn.activation = activation
    nn.dactivation = dactivation

    // Number of columns in a matrix is equivalent to the number of inputs into the layer
    // Number of rows is equivalent to the number of nodes in the layer
    nn.ihWeights = math.random([nHidden, nInputs], -1, 1)
    nn.ihBias = math.ones([nHidden,1])
    
    nn.hhWeights = math.random([nHiddenLayers-1, nHidden, nHidden], -1, 1)
    nn.hhBias = math.ones([nHiddenLayers-1, nHidden, 1])

    nn.hoWeights = math.random([nOutputs, nHidden], -1, 1)
    nn.hoBias = math.ones([nOutputs,1])

    /**
     * Get a prediction based on the current state of the network
     * @param {Array} input
     */
    nn.predict = input => {
      // Output of input through first hidden layer
      const ihOut = nn.feedForward(input, nn.ihWeights, nn.ihBias)
      
      // Output of all other hidden layers
      let hhOut = null
      if(nn.hhWeights.length==0) {
        hhOut = ihOut
      } else {
        hhOut = nn.hhWeights.reduce((acc, weights, i)=> nn.feedForward(acc, weights, nn.hhBias[i]), ihOut)
      }

      // Output of hidden layer through output layer
      return nn.feedForward(hhOut, nn.hoWeights, nn.hoBias)
    }

    /**
     * Feed the input forward through a layer
     * @param {Array} input Matrix of outputs from the previous layer
     * @param {Array} weights Matrix of weights for the layer
     * @param {Array} bias Matrix of bias for the layer
     */
    nn.feedForward = (input, weights, bias) => {
      // Calculate weighted value of inputs for all 
      const weighted = math.multiply(weights, input)
      // Add bias to weighted values
      const biased = math.add(weighted, bias)
      // Run each node output through activation function
      return biased.map(row => row.map(nn.activation))
    }

    /**
     * Train the network based on a single input and the target
     * @param {Array} input 
     * @param {Array} target 
     */
    nn.train = (input, target) => {
      const values = nn._train(input, target)
      nn._update(values)
    }

    /**
     * Train the network based on a batch of inputs and their targets
     * @param {Array} inputs 
     * @param {Array} targets 
     */
    nn.trainBatch = (inputs, targets) => {
      const values = inputs.reduce(
        (acc, input, i) => {
          const val = nn._train(input, targets[i])
          if (i==0) return val
          else return acc.map((v, j) => (j==2 || j==3) ? 
            v.map((layer, k) => math.add(layer, val[j][k])) :
            math.add(v, val[j]))
        }, null)

      nn._update(values)
    }

    /**
     * 
     * @param {Array} input 
     * @param {Array} target 
     */
    nn._train = (input, target) => {
      // Calculates the gradient and weightsDelta for a layer
      const calcValues = (output, error, nextLayerOutput) => {
        // Derivative of current layers output
        const dOut = output.map(row => row.map(nn.dactivation))
        // This particular step requires element wise multiplication
        const gradient = math.dotMultiply(math.multiply(dOut, nn.lr), error)
        const weightsDelta = math.multiply(gradient, math.transpose(nextLayerOutput))
        return [gradient, weightsDelta]
      }

      // Output of input through first hidden layer
      const ihOut = nn.feedForward(input, nn.ihWeights, nn.ihBias)
      // Output of all other hidden layers
      const hhOuts = []
      if(nn.hhWeights.length>0) {
        nn.hhWeights.forEach((weights, i)=> {
          hhOuts.push(hhOuts.length==0 ? 
            nn.feedForward(ihOut, weights, nn.hhBias[i]) :
            nn.feedForward(hhOuts[i-1], weights, nn.hhBias[i]) )
        })
      }
      // Output of output layer
      const hoOut = nn.feedForward(
        nn.hhWeights.length==0 ? ihOut : hhOuts[hhOuts.length-1], 
        nn.hoWeights, nn.hoBias)

      // Training values for Output Layer
      // Error is difference between prediction and target
      const hoOutError = math.subtract(target, hoOut)
      const [hoGradient, hoWeightsDelta] = calcValues(hoOut, hoOutError, nn.hhWeights.length>0 ? hhOuts[hhOuts.length-1] : ihOut)

      // Training values for Hidden Layers
      const hhGradients = []
      const hhWeightsDeltas = []
      let hiddenError = null
      if(nn.hhWeights.length>0) {
        for(let i=nn.hhWeights.length-1; i>=0; i--) {
          // Error is the contribution of each node toward the error of this layer via their weights
          hiddenError = i==nn.hhWeights.length-1 ? 
            math.multiply(math.transpose(nn.hoWeights), hoOutError) :
            math.multiply(math.transpose(nn.hhWeights[i]), hiddenError)
          const [gradient, weightsDelta] = calcValues(hhOuts[i], hiddenError, i==0 ? ihOut : hhOuts[i-1])
          // Store values for later
          hhGradients.unshift(gradient)
          hhWeightsDeltas.unshift(weightsDelta)
        }
      }

      // Training values for Input Layer
      const ihOutError = nn.hhWeights.length>0 ? 
        math.multiply(math.transpose(nn.hhWeights[0]), hiddenError) :
        math.multiply(math.transpose(nn.hoWeights), hoOutError)
      const [ihGradient, ihWeightsDelta] = calcValues(ihOut, ihOutError, input)

      return [ihGradient, ihWeightsDelta, hhGradients, hhWeightsDeltas, hoGradient, hoWeightsDelta]
    }

    /**
     * 
     * @param {*} values 
     */
    nn._update = values => {
      const [ihGradient, ihWeightsDelta, hhGradients, hhWeightsDeltas, hoGradient, hoWeightsDelta] = values
      // Update weights and biases of the nn using outcome of _train
      // the weight of bias is always 1, so the change is only the gradient
      nn.hoWeights = math.add(nn.hoWeights, hoWeightsDelta)
      nn.hoBias = math.add(nn.hoBias, hoGradient)

      nn.hhWeights = nn.hhWeights.map((layer, i) => math.add(layer, hhWeightsDeltas[i]))
      nn.hhBias = nn.hhBias.map((layer,i) => math.add(layer, hhGradients[i]))

      nn.ihWeights = math.add(nn.ihWeights, ihWeightsDelta)
      nn.ihBias = math.add(nn.ihBias, ihGradient)
    }

    return nn
  }
}