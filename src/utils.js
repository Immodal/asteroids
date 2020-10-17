const Utils = {
  /**
   * Returns true if n is a number
   * https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript
   */
  isNumber: n => !isNaN(parseFloat(n)) && !isNaN(n - 0),

  /**
   * Shuffles array in place
   */
  shuffle: arr => {
    let j, x;
    for (let i = arr.length - 1; i > 0; i--) {
      j = math.randomInt(0, i)
      x = arr[i]
      arr[i] = arr[j]
      arr[j] = x
    }
  }
}