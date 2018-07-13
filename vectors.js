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
      theta: 45 * Math.PI / 180,
      fi: 45 * Math.PI / 180,
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
  
  static fromVector(v) {
    if(v.sizeX >= 3)
      return new Point3d(v.get(0,0), v.get(1,0), v.get(2,0));
    if(v.sizeY >= 3)
      return new Point3d(v.get(0,0), v.get(0,1), v.get(0,2));
    throw "Zbyt mały wektor";
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
  
  multiply(mat) {
    if(mat.sizeX != this.sizeY || mat.sizeY != this.sizeX) throw "wrong sizes";

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
}

let m = new Matrix(2,3, true);
m.loadArray([1,2,3,4,5,6]);
let mt = m.transposition();

console.log(m, mt);
console.log(m.print());
console.log(mt.print());

let m1 = new Matrix(3,2);
m1.loadArray([2,3,4,1,0,0]);
let m2 = new Matrix(2,3);
m2.loadArray([0,1000,1,100,0,10]);

let m3 = m1.multiply(m2);
let m4 = m2.multiply(m1);

console.log(m3.print());
console.log(m4.print());