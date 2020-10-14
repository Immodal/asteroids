DemoBase = () => {
  const db = {}

  db.makeDiv = (p, parent, title) => {
    const div = p.createDiv()
    div.parent(parent)
    div.class("section")
    const titleObj = p.createElement('h3', title)
    titleObj.parent(div)
    titleObj.class("title")
    return div
  }

  db.makeButton = (p, parent, title, callback=()=>{}) => {
    btn = p.createButton(title)
    btn.parent(parent)
    btn.mousePressed(callback)
    return btn
  }

  db.makeCheckbox = (p, parent, title, callback=()=>{}, value=false) => {
    cb = p.createCheckbox(title, value)
    cb.parent(parent)
    cb.changed(callback)
    return cb
  }

  db.makeSliderGroup = (p, parent, title, sliderMin, sliderMax, sliderStart, sliderStep, sliderCallback=()=>{}) => {
    const titleObj = p.createP(title)
    titleObj.parent(parent)
    const slider = p.createSlider(sliderMin, sliderMax, sliderStart, sliderStep)
    slider.parent(parent)
    const label = p.createSpan(`${slider.value()}`)
    label.parent(titleObj)
    slider.changed(() => {
      label.html(slider.value())
      sliderCallback()
    })
    return slider
  }

  db.makeInputGroup = (p, parent, title, value, callback=null) => {
    const titleObj = p.createP(title)
    titleObj.parent(parent)

    const input = p.createInput(value)
    input.parent(titleObj)
    input.size(50)

    if (callback!=null) {
      const button = p.createButton("Set")
      button.parent(titleObj)
      button.mousePressed(() => callback(input))
    }

    return input
  }

  /**
   * Validates and Updates the given input
   */
  db.updateNumberInput = (min, max, initial, isInt=false, restart=true) => inputObj => {
    if (Utils.isNumber(inputObj.value())) {
      const value = isInt ? math.floor(inputObj.value()) : inputObj.value()
      if (value<min) inputObj.value(min)
      else if (value>max) inputObj.value(max)
    } else inputObj.value(initial)

    if (restart) db.restart()
  }

  db.makeDataLabel = (p, parent, title, value, inline=false) => {
    const titleObj = inline ? p.createSpan(title) : p.createP(title)
    titleObj.parent(parent)
    const label = p.createSpan(value)
    label.parent(titleObj)

    return label
  }

  db.makeFileInputGroup = (p, parent, title, callback) => {
    const titleObj = p.createP(title)
    titleObj.parent(parent)

    const fileInput = p.createFileInput(callback);
    fileInput.parent(titleObj);

    return fileInput
  }

  return db
}