/**
 * Used in InnovationHistory for individual innovations
 */
InnovationEntry = (fromId, toId, innovation) => {
  const ie = {}

  /**
   * Initialize all values for the object
   */
  const init = () => {
    ie.fromId = fromId
    ie.toId = toId
    ie.innovation = innovation
    return ie
  }

  /**
   * Check if a potential connection would match this entry
   * @param {Integer} fId Id of From Node
   * @param {Integer} tId Id of To Node
   */
  ie.matches = (fId, tId) => fId == ie.fromId && tId == ie.toId

  return init()
}