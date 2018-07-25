class Point {
  constructor(x, y) {
    if((typeof x != "number") || (typeof y != "number")) 
      throw "Błędne dane dla punktu";
    this.x = x || 0;
    this.y = y || 0;
  }
  
  static fromPoint3D(p3d) {
    let skewing = {
      part: 2/3,
      theta: 0 * Math.PI / 180,
      fi: 0 * Math.PI / 180,
    }

    let x = p3d.x + p3d.z * Math.sin(skewing.theta) * skewing.part;
    let y = p3d.y + p3d.z * Math.sin(skewing.fi) * skewing.part;
    return new Point(x, y);   
  }
}

class Point3d {
  constructor(x, y, z) {
    if((typeof x != "number") || (typeof y != "number") || (typeof z != "number")) 
      throw "Błędne dane dla punktu";
    this.x = x || 0;
    this.y = y || 0;    
    this.z = z || 0;    
  }
  
  add(p3d) {
    return new Point3d(this.x + p3d.x, this.y + p3d.y, this.z + p3d.z);     
  }
  
  multiply(scalar) {
    return new Point3d(this.x * scalar, this.y * scalar, this.z * scalar);    
  }
  
  static fromVector(v) {
    if(v.sizeX >= 3)
      return new Point3d(v.get(0,0), v.get(1,0), v.get(2,0));
    if(v.sizeY >= 3)
      return new Point3d(v.get(0,0), v.get(0,1), v.get(0,2));
    throw "Zbyt mały wektor";
  }
  
  toArray() {
    return [this.x, this.y, this.z];
  }
}

class Matrix {
  constructor(sizeX, sizeY, identity) {
    if((typeof sizeX != "number") || (typeof sizeY != "number") || sizeX < 1 || sizeY < 1) 
      throw "Błędne dane dla macierzy";    
    
    this.sizeX = sizeX || 1;
    this.sizeY = sizeY || 1;
    
    this.values = [];
    
    for (var y = 0; y < this.sizeY; y++) {
      for (var x = 0; x < this.sizeX; x++) {
        let v = 0 + (!!identity && x == y);
        this.values.push(v);
      }      
    }
  }
  
  get(x, y) {
    if(x >= this.sizeX) throw "x is out of bouds";
    if(y >= this.sizeY) throw "y is out of bouds";
    
    return this.values[x + y * this.sizeX];
  }
  
  set(x,y, v) {
    if(x >= this.sizeX) throw "x is out of bouds";
    if(y >= this.sizeY) throw "y is out of bouds";
    
    this.values[x + y * this.sizeX] = v;
    return this;
  }
  
  loadArray(arr) {
    if(arr.length == this.sizeX * this.sizeY)
      this.values = arr;
    return this;
  } 
  
  transposition() {
    let mt = new Matrix(this.sizeY, this.sizeX);
    for (let x = 0; x < this.sizeX; x++) {
      for (let y = 0; y < this.sizeY; y++) {
        mt.set(y, x, this.get(x,y));
      }
    }
    return mt;
  }
  
  add(mat) {
    if(mat.sizeX != this.sizeX || mat.sizeY != this.sizeY) throw "wrong sizes";
    let mt = new Matrix(this.sizeX, this.sizeY);
    for (var x = 0; x < this.sizeX; x++) {
      for (var y = 0; y < this.sizeY; y++) {
        mt.set(x, y, this.get(x,y) + mat.get(x,y));
      }
    }
    return mt;
  }  
  
  multiplyScalar(scalar) {
    for (let i = 0; i < this.values.length; i++) {
     this.values[i] *= scalar;      
    }
  }
  
  multiply(mat) {
    if(/*mat.sizeX != this.sizeY ||*/ mat.sizeY != this.sizeX) throw "wrong sizes";

    let mt = new Matrix(mat.sizeX, this.sizeY);
    for (var x = 0; x < mat.sizeX; x++) {
      for (var y = 0; y < this.sizeY; y++) {
        let v = 0;
        for (var r = 0; r < this.sizeX; r++) {
          v += mat.get(x,r) * this.get(r,y);
        }
        mt.set(x, y, v);
      }
    }
    return mt;
  } 
  
  print(){    
    let str = "";
    for (var y = 0; y < this.sizeY; y++) {
      str += "|";
      for (var x = 0; x < this.sizeX; x++) {
        let v = '' + this.get(x,y);
        str += v.padStart(4) + ' ';
      }
      str += "|\n";
    }
    return str;
  }  
  
  static fromPoint3D(point3d) {
    let m = new Matrix(1, 4);
    m.loadArray([point3d.x, point3d.y, point3d.z, 1]);
    return m;    
  }
}

class transformationMatrix {
  constructor() {
    this.zoom = 1;
    this.angleX = 0;
    this.angleY = 0;
    this.angleZ = 0;
  }
  
  contructAllMatrix() {
    let Rx = this.constructXMatrix();
    let Ry = this.constructYMatrix();
    let Rz = this.constructZMatrix();    
    let Z = this.constructZoomMatrix();    
    return Rx.multiply(Ry).multiply(Rz).multiply(Z);
  }

  constructXMatrix() {
    let m = new Matrix(4, 4, true);
    m.set(1,1, Math.cos(this.angleX));
    m.set(2,1, -1 * Math.sin(this.angleX));
    m.set(1,2, Math.sin(this.angleX));
    m.set(2,2, Math.cos(this.angleX));
    return m;
  }
  
  constructYMatrix() {
    let m = new Matrix(4, 4, true);
    m.set(0,0, Math.cos(this.angleY));
    m.set(2,0, -1 * Math.sin(this.angleY));
    m.set(0,2, Math.sin(this.angleY));
    m.set(2,2, Math.cos(this.angleY));
    return m;
  }  
  
  constructZMatrix() {
    let m = new Matrix(4, 4, true);
    m.set(0,0, Math.cos(this.angleZ));
    m.set(1,0, -1 * Math.sin(this.angleZ));
    m.set(0,1, Math.sin(this.angleZ));
    m.set(1,1, Math.cos(this.angleZ));
    return m;
  }
  
  constructZoomMatrix() {
    let m = new Matrix(4, 4, true);
    m.set(0,0, this.zoom);
    m.set(1,1, this.zoom);
    m.set(2,2, this.zoom);
    return m;    
  }
}

class sceneObject {
  constructor(position3d, label) {
    this.position = position3d || new Point3d(0, 0, 0);
    this.label = label || "?";
  }
}

class scenePathPoint{
  constructor(position3d) {
    this.position = position3d || new Point3d(0, 0, 0);
  }  
}

class sceneEllipse {
  constructor(center, vectorSemiMinor, vectorSemiMajor) {
    this.center = center;     
    this.vectorSemiMinor = vectorSemiMinor;  
    this.vectorSemiMajor = vectorSemiMajor;
    
    this.objects = [];
    this.build();
  }
  
  build() {   
    for(let i = 0; i < 50; i++) {
      let t = i * 2 * Math.PI / 50;
      let p3d = new Point3d(this.center.x + this.vectorSemiMinor.x * Math.cos(t) + this.vectorSemiMajor.x * Math.sin(t), 
                            this.center.y + this.vectorSemiMinor.y * Math.cos(t) + this.vectorSemiMajor.y * Math.sin(t), 
                            this.center.z + this.vectorSemiMinor.z * Math.cos(t) + this.vectorSemiMajor.z * Math.sin(t));  
      
      this.objects.push(new scenePathPoint(p3d));
    }      
  }
  
  [Symbol.iterator]() { 
    return this.objects.values(); 
  }  
}

class Planet {
  constructor(name, orbit, trueAnomaly) {
    this.name = name;
    this.orbit = orbit;    
    this.position = orbit.getObjectPosition(trueAnomaly);    
    
    this.objects = [new sceneObject(this.position, this.name)];
  }
  
  [Symbol.iterator]() { 
    return this.objects.values(); 
  }  
}

class Orbit {
  constructor(foci, semiMajorAxis, eccentricity, inclination, ascendingNodeAngle, periapsisAngle) {
    this.semiMajorAxis = semiMajorAxis;
    this.semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);        
    this.eccentricity = eccentricity;  
    
    this.inclination = inclination * Math.PI * 2 / 360;
    this.ascendingNodeAngle = ascendingNodeAngle * Math.PI * 2 / 360;
    this.periapsisAngle = periapsisAngle * Math.PI * 2 / 360;
    
    this.foci = foci;

    this.objects = [];
    this.build();    
  }
  
  getObjectPosition(trueAnomaly) {
    let t = trueAnomaly * 2 * Math.PI / 360;
    let p3d = new Point3d(this.ellipse.center.x + this.ellipse.vectorSemiMinor.x * Math.cos(t) + this.ellipse.vectorSemiMajor.x * Math.sin(t), 
                          this.ellipse.center.y + this.ellipse.vectorSemiMinor.y * Math.cos(t) + this.ellipse.vectorSemiMajor.y * Math.sin(t), 
                          this.ellipse.center.z + this.ellipse.vectorSemiMinor.z * Math.cos(t) + this.ellipse.vectorSemiMajor.z * Math.sin(t));      
    return p3d;  
  }
  
  addPlanet(name, trueAnomaly) {
    this.objects.push(new Planet(name, this, trueAnomaly));
  }
  
  build() {
    let pA = new Matrix(3, 3, true);
    pA.set(0,0, Math.cos(this.periapsisAngle));
    pA.set(1,0, Math.sin(this.periapsisAngle));
    pA.set(0,1, -1 * Math.sin(this.periapsisAngle));
    pA.set(1,1, Math.cos(this.periapsisAngle));
    
    let iA = new Matrix(3, 3, true);
    iA.set(1,1, Math.cos(this.inclination));
    iA.set(2,1, Math.sin(this.inclination));
    iA.set(1,2, -1 * Math.sin(this.inclination));
    iA.set(2,2, Math.cos(this.inclination));
    
    let anA = new Matrix(3, 3, true);
    anA.set(0,0, Math.cos(this.ascendingNodeAngle));
    anA.set(1,0, Math.sin(this.ascendingNodeAngle));
    anA.set(0,1, -1 * Math.sin(this.ascendingNodeAngle));
    anA.set(1,1, Math.cos(this.ascendingNodeAngle));  
    
    let m = pA.multiply(iA).multiply(anA);
    
    let v1 = new Point3d(m.get(0,0), m.get(1,0), m.get(2,0));
    let v2 = new Point3d(m.get(0,1), m.get(1,1), m.get(2,1));
    
    let c = Math.sqrt(this.semiMajorAxis * this.semiMajorAxis - this.semiMinorAxis * this.semiMinorAxis);
    let cv = v1.multiply(c * -1);
    
    let center = this.foci.add(cv);
    
    this.ellipse = new sceneEllipse(center, v1.multiply(this.semiMajorAxis), v2.multiply(this.semiMinorAxis));
    
    this.objects.push(this.ellipse);     
  }
  
  [Symbol.iterator]() { 
    return this.objects.values(); 
  } 
}

class Scene {
  constructor() {
    this.objects = [];
  }  
  
  initExample() {
    for(let i = 0; i < 30; i++) {
      let p3d = new Point3d(150 * Math.cos(i * 2 * Math.PI / 30), 150 * Math.sin(i * 2* Math.PI / 30), 0);      
      this.objects.push(new sceneObject(p3d, i+1));
    }    
  }
  
  initCircle() {
    let v1 = new Point3d(150, 0, 50);
    let v2 = new Point3d(0, 180, 0);
    let c = new Point3d(50, 25, 75);
    
    for(let i = 0; i < 30; i++) {
      let t = i * 2 * Math.PI / 30;
      let p3d = new Point3d(c.x + v1.x * Math.cos(t) + v2.x * Math.sin(t), c.y + v1.y * Math.cos(t) + v2.y * Math.sin(t), c.z + v1.z * Math.cos(t) + v2.z * Math.sin(t));      
      this.objects.push(new sceneObject(p3d, i+1));
    }     
  }
  
  initEllipse() {
    this.objects.push(new sceneEllipse(200, 0.5));
  }   
  
  initOrbit() {   
    this.objects.push(new Orbit(new Point3d(0, 0, 0), 30 * 0.387098, 0.205630, 7.005, 48.331, 29.124));
    this.objects[this.objects.length - 1].addPlanet("Mercury", 0);
    this.objects.push(new Orbit(new Point3d(0, 0, 0), 30 * 0.723332, 0.006772, 3.39458, 76.680, 54.884));
    this.objects[this.objects.length - 1].addPlanet("Venus", 0);
    this.objects.push(new Orbit(new Point3d(0, 0, 0), 30, 0.016, 0, -11.26064, 114.20783));
    this.objects[this.objects.length - 1].addPlanet("Earth", 0);
    this.objects.push(new Orbit(new Point3d(0, 0, 0), 30 * 1.523679, 0.0934, 1.850, 49.558, 286.502));
    this.objects[this.objects.length - 1].addPlanet("Mars", 0);
    this.objects.push(new Orbit(new Point3d(0, 0, 0), 30 * 5.2044, 0.0489, 1.303, 100.464, 273.867));
    this.objects[this.objects.length - 1].addPlanet("Jupiter", 0);
    this.objects.push(new Orbit(new Point3d(0, 0, 0), 30 * 39.48, 0.2488, 17.16, 110.299, 113.834));
    this.objects[this.objects.length - 1].addPlanet("Pluto", 0);
  } 
  
  [Symbol.iterator]() { 
    return this.objects.values(); 
  }
}

class Drawer {
  constructor() {
    this.canvas = document.createElement("canvas");    
    this.context = this.canvas.getContext("2d");
    this.canvas.height = window.innerHeight - 22;
    this.canvas.width = window.innerWidth - 22;
    document.body.appendChild(this.canvas);    
    
    this.viewport = {
			zoom: 1,
			x: this.canvas.width / 2,
			y: this.canvas.height / 2,
		}
      
    this.initControls();
    
    this.tm = new transformationMatrix();      
    this.setTransform();
  }
  
  initControls() {
    let fieldset = document.createElement("fieldset");
    let legend = document.createElement("legend");
    legend.innerHTML = "Rotation";
    fieldset.appendChild(legend);

    let inputX = document.createElement("input");
    inputX.min = 0; inputX.max = 360; inputX.value = 0;
    inputX.type = "range";
    inputX.setAttribute("list","ticks360");
    inputX.oninput = this.updateRotationX.bind(this);
    fieldset.appendChild(inputX);
    
    let inputY = document.createElement("input");
    inputY.min = 0; inputY.max = 360; inputY.value = 0;
    inputY.type = "range";
    inputY.setAttribute("list","ticks360");
    inputY.oninput = this.updateRotationY.bind(this);
    fieldset.appendChild(inputY);
    
    let inputZ = document.createElement("input");
    inputZ.min = 0; inputZ.max = 360; inputZ.value = 0;
    inputZ.type = "range";
    inputZ.setAttribute("list","ticks360");
    inputZ.oninput = this.updateRotationZ.bind(this);
    fieldset.appendChild(inputZ);  
    
    let inputZoom = document.createElement("input");
    inputZoom.min = 2; inputZoom.max = 100; inputZoom.value = 10;
    inputZoom.type = "range";
    inputZoom.setAttribute("list","ticksZoom");
    inputZoom.oninput = this.updateZoom.bind(this);
    fieldset.appendChild(inputZoom);      
    
    document.body.appendChild(fieldset);
  }
  
  updateRotationX(e) {
    let angleDeg = e.target.value;
    this.tm.angleX = (angleDeg / 360) * 2 * Math.PI;
  }
  
  updateRotationY(e) {
    let angleDeg = e.target.value;
    this.tm.angleY = (angleDeg / 360) * 2 * Math.PI;
  }
  
  updateRotationZ(e) {
    let angleDeg = e.target.value;
    this.tm.angleZ = (angleDeg / 360) * 2 * Math.PI;
  }  
  
  updateZoom(e) {
    let zoom = e.target.value / 10;
    this.tm.zoom = zoom;
  }  
  
  setTransform(viewport) {
    viewport = viewport || this.viewport;
    this.context.setTransform(viewport.zoom, 0, 0, viewport.zoom, viewport.x, viewport.y);
  }
  
  clear() {
    this.setTransform({zoom: 1, x: 0, y: 0});
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.setTransform();
  }  

  getPointFromPoint3d(point3d) {
    let v = Matrix.fromPoint3D(point3d);
    v = this.tm.contructAllMatrix().multiply(v);
    let p3d = Point3d.fromVector(v)
    return Point.fromPoint3D(p3d);    
  }
  
  drawPoint3d(point3d) {
    this.drawPoint(this.getPointFromPoint3d(point3d));
  }
  
  drawLine3d(point3dFrom, point3dTo) {
    let pointFrom = this.getPointFromPoint3d(point3dFrom);
    let pointTo = this.getPointFromPoint3d(point3dTo);
    this.drawLine(pointFrom, pointTo);
  }
    
  drawPoint(point) {
    this.context.beginPath();
    this.context.arc(point.x, -point.y, 2, 0, 2 * Math.PI);  
    this.context.stroke();
  }
  
  drawLine(pointFrom, pointTo) {
    this.context.beginPath();
    this.context.moveTo(pointFrom.x, -pointFrom.y);
    this.context.lineTo(pointTo.x, -pointTo.y);
    this.context.stroke();   
  }
  
  drawText(point3d, text) {
    let point = this.getPointFromPoint3d(point3d);
    this.context.font="10px Arial";
    this.context.textAlign="center";
    this.context.textBaseline="middle";
    this.context.fillText(text, point.x + 7, - point.y - 7);
  }  
  
  drawReference() {
    let p0 = new Point3d(0, 0, 0);
    let p1 = new Point3d(30, 0, 0);
    let p2 = new Point3d(0, 30, 0);
    let p3 = new Point3d(0, 0, 30);  
    
    this.context.strokeStyle="red";
    this.drawPoint3d(p1);
    this.drawLine3d(p0, p1);
    this.context.strokeStyle="green";
    this.drawPoint3d(p2);        
    this.drawLine3d(p0, p2);
    this.context.strokeStyle="blue";
    this.drawPoint3d(p3);
    this.drawLine3d(p0, p3);    
    this.context.strokeStyle="black";
  }
  
  render(obj) {
    if(obj instanceof Scene) {
      for (let so of obj) {
        this.render(so); // scene
      }
    }
    if(obj instanceof sceneEllipse) {      
      this.context.beginPath();
      let p = this.getPointFromPoint3d(obj.objects[0].position);
      this.context.moveTo(p.x,-p.y);
      for (let spp of obj) {
        p = this.getPointFromPoint3d(spp.position);
        this.context.lineTo(p.x, -p.y);
      } 
      this.context.closePath();
      this.context.stroke(); 
    }   
    if(obj instanceof Planet) {      
      for (let so of obj) {
        this.render(so); // scene
      } 
    }      
    if(obj instanceof Orbit) {      
      for (let so of obj) {
        this.render(so); // scene
      } 
    }    
    if(obj instanceof sceneObject) {
      this.drawPoint3d(obj.position);
      this.drawText(obj.position, obj.label);
    }
  }
}


let drawer = new Drawer();
let scene = new Scene();
scene.initOrbit();
console.log(scene);

function step() {
  drawer.clear();
  drawer.drawReference();
  drawer.render(scene);
   
  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
