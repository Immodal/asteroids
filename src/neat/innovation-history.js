/**
 * Used to globally track innovations of a population
 */
InnovationHistory = (startNum) => {
  const ih = {}

  /**
   * Initialize all values for the object
   */
  constructor = () => {
    ih.current = startNum
    ih.entries = []
    return ih
  }

  /**
   * Add an entry, if it exists, return the number, otherwise create and add new entry and return the number.
   * @param {Integer} fId Id of From Node
   * @param {Integer} tId Id of To Node
   * @param {Array} gInnovations Innovation numbers the genome possesses
   */
  ih.add = (fId, tId, gInnovations) => {
    for(let i=0; i<ih.entries.length; i++) {
      if(ih.entries[i].matches(fId, tId, gInnovations)) return ih.entries[i].innovation
    }
    const entry = InnovationEntry(fId, tId, ih.current++, gInnovations)
    ih.push(entry)
    return entry.innovation
  }

  return constructor()
}