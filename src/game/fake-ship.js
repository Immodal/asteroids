FakeShip = (x, y, diameter) => {
  const fs = Ship(x, y, diameter)

  fs.acc = createVector(0,0);
  fs.acceleration = .2;
  fs.maxSpeed = 5;

  fs.seek = (target) => {
    //Copy target & subtract this location tp find vector to turn towards
    let lookVector = target.copy().sub(fs.pos);
    lookVector.normalize();
    lookVector.mult(fs.acceleration);
    fs.applyForce(lookVector);
  }
  
  //Add force to acceleration
  fs.applyForce = (force) => {
    fs.acc.add(force);
  }
  
  //apply acceleration and move
  fs.move = () => {
    fs.velocity.add(fs.acc);
    fs.velocity.limit(fs.maxSpeed);
    fs.pos.add(fs.velocity);
    fs.rotation = fs.acc.heading()
    fs.acc.mult(0);
    // X
    if (fs.pos.x > width + fs.diameter) fs.pos.x = 0 - fs.diameter
    else if (fs.pos.x < 0 - fs.diameter) fs.pos.x = width + fs.diameter
    // Y
    if (fs.pos.y > height + fs.diameter) fs.pos.y = 0 - fs.diameter
    else if (fs.pos.y < 0 - fs.diameter) fs.pos.y = height + fs.diameter
  }

  return fs
}