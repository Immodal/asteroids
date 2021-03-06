/**
 * Used to globally track innovations of a population
 */
InnovationHistory = (startNum) => {
  const ih = {}

  /**
   * Initialize all values for the object
   */
  const init = () => {
    ih.current = startNum
    ih.entries = []
    return ih
  }

  /**
   * Add an entry, if it exists, return the number, otherwise create and add new entry and return the number.
   * @param {Integer} fId Id of From Node
   * @param {Integer} tId Id of To Node
   */
  ih.add = (fId, tId) => {
    for(let i=0; i<ih.entries.length; i++) {
      if(ih.entries[i].matches(fId, tId)) return ih.entries[i].innovation
    }
    const entry = InnovationEntry(fId, tId, ih.current++)
    ih.entries.push(entry)
    return entry.innovation
  }

  return init()
}