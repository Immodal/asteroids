DemoBase = () => {
  const db = {}

  db.makeDiv = (parent, title) => {
    const div = createDiv()
    div.parent(parent)
    div.class("section")
    const titleObj = createElement('h3', title)
    titleObj.parent(div)
    titleObj.class("title")
    return div
  }

  db.makeButton = (parent, title, callback=()=>{}) => {
    btn = createButton(title)
    btn.parent(parent)
    btn.mousePressed(callback)
    return btn
  }

  db.makeCheckbox = (parent, title, callback=()=>{}, value=false) => {
    cb = createCheckbox(title, value)
    cb.parent(parent)
    cb.style("color", "#dcdcdc")
    cb.changed(callback)
    return cb
  }

  db.makeSliderGroup = (parent, title, sliderMin, sliderMax, sliderStart, sliderStep, sliderCallback=()=>{}) => {
    const [slider, _] = db.makeSliderGroup2(parent, title, sliderMin, sliderMax, sliderStart, sliderStep, sliderCallback)
    return slider
  }

  db.makeSliderGroup2 = (parent, title, sliderMin, sliderMax, sliderStart, sliderStep, sliderCallback=()=>{}) => {
    const titleObj = createP(title)
    titleObj.parent(parent)
    const slider = createSlider(sliderMin, sliderMax, sliderStart, sliderStep)
    slider.parent(parent)
    const label = createSpan(`${slider.value()}`)
    label.parent(titleObj)
    slider.changed(() => {
      label.html(slider.value())
      sliderCallback()
    })
    return [slider, label]
  }

  db.makeSliderGroup3 = (title, titleParent, sliderParent, sliderMin, sliderMax, sliderStart, sliderStep, sliderCallback=()=>{}) => {
    const titleObj = createP(title)
    titleObj.parent(titleParent)
    const slider = createSlider(sliderMin, sliderMax, sliderStart, sliderStep)
    slider.parent(sliderParent)
    const label = createSpan(`${slider.value()}`)
    label.parent(titleObj)
    slider.changed(() => {
      label.html(slider.value())
      sliderCallback()
    })
    return [slider, label]
  }

  db.makeRadioGroup = (parent, options, defaultValInd) => {
    const rad = createRadio()
    rad.parent(parent)
    options.forEach(op => {
      if (op instanceof Array) rad.option(op[0], op[1])
      else rad.option(op)
    })
    if (options[defaultValInd] instanceof Array) rad.selected(options[defaultValInd][0])
    else rad.selected(options[defaultValInd])

    rad.style("color", "#dcdcdc")

    return rad
  }

  db.makeSelectGroup = (parent, title, options, defaultValInd, callback=()=>{}) => {
    const titleObj = createP(title)
    titleObj.parent(parent)

    const sel = createSelect()
    sel.parent(titleObj)
    options.forEach((op, i) => {
      sel.option(op)
      if (i==defaultValInd && options[op]!=null) sel.selected(options[defaultValInd])
    })
    sel.changed(callback)

    return sel
  }

  db.makeInputGroup = (parent, title, value, callback=null) => {
    const titleObj = createP(title)
    titleObj.parent(parent)

    const input = createInput(value)
    input.parent(titleObj)
    input.size(50)

    if (callback!=null) {
      const button = createButton("Set")
      button.parent(titleObj)
      button.mousePressed(() => callback(input))
    }

    return input
  }

  /**
   * Validates and Updates the given input
   */
  db.updateNumberInput = (min, max, initial, isInt=false, restart=false) => inputObj => {
    if (Utils.isNumber(inputObj.value())) {
      const value = isInt ? math.floor(inputObj.value()) : inputObj.value()
      if (min != null && value<min) inputObj.value(min)
      else if (max != null && value>max) inputObj.value(max)
      else inputObj.value(value)
    } else inputObj.value(initial)

    if (restart) db.restart()
  }

  db.makeDataLabel = (parent, title, value, inline=false) => {
    const titleObj = inline ? createSpan(title) : createP(title)
    titleObj.parent(parent)
    const label = createSpan(value)
    label.parent(titleObj)

    return label
  }

  db.makeFileInputGroup = (parent, title, callback) => {
    const titleObj = createP(title)
    titleObj.parent(parent)

    const fileInput = createFileInput(callback);
    fileInput.parent(titleObj);

    return fileInput
  }

  return db
}