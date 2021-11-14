import { Dims, Point } from "../shared/models";

export function shuffle<T>(array: T[]): T[] {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

export function arrayRotate<T>(arr: T[], count: number): T[] {
  count -= arr.length * Math.floor(count / arr.length);
  arr.push.apply(arr, arr.splice(0, count));
  return arr;
}

export function rotate(origin: Point, point: Point, angle: number): Point {
  var radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (point.x - origin.x)) + (sin * (point.y - origin.y)) + origin.x,
      ny = (cos * (point.y - origin.y)) - (sin * (point.x - origin.x)) + origin.y;
  return {
    x: nx,
    y: ny,
  };
}

export var round = (N,acc = 100000) => {
  return Math.round(N * acc) / acc
}


export function generateSquareQuarters(center: Point, dims: Dims, radius: number): Point[][]{
  const xStep = radius * dims.width / 2;
  const yStep = radius * dims.height / 2;

  const topRight: Point[] = [
    {x: center.x, y: center.y},
    {x: center.x + xStep, y: center.y},
    {x: center.x + xStep, y: center.y - yStep},
    {x: center.x, y: center.y - yStep},
  ]

  const topLeft: Point[] = [
    {x: center.x, y: center.y},
    {x: center.x, y: center.y - yStep},
    {x: center.x - xStep, y: center.y - yStep},
    {x: center.x - xStep, y: center.y},
  ]

  const bottomLeft: Point[] = [
    {x: center.x, y: center.y},
    {x: center.x - xStep, y: center.y},
    {x: center.x - xStep, y: center.y + yStep},
    {x: center.x, y: center.y + yStep},    
  ]

  const bottomRight: Point[] = [
    {x: center.x, y: center.y},
    {x: center.x, y: center.y + yStep},
    {x: center.x + xStep, y: center.y + yStep},
    {x: center.x + xStep, y: center.y},
  ]
  const corners: Point[][] = [
    topRight,
    topLeft,
    bottomLeft,
    bottomRight,
  ]
  return corners;
}  

export function flatten<T>(grid: T[][]):T[]{
  return grid.reduce((acc, val) => acc.concat(val), []);
}

export function getSpiral(
  origin: Point,
  startAngle: number,
  rotation: number, 
  startRadius: number, 
  endRadius: number,
  pointCount: number, 
): Point[] {
  const rStep = (startRadius - endRadius) / pointCount;
  const aStep = rotation / pointCount;
  const points: Point[] = []
  for(let i = 0; i < pointCount; i++){
    const r = startRadius - (i) * rStep;
    const a = startAngle + (i * aStep);
    let x = origin.x + Math.cos(a) * r;
    let y = origin.y + Math.sin(a) * r;
    points.push({x,y});
  }
  return points;
}

export function getRadialVertices(
  origin: Point, 
  radius: number, 
  vertices: number = 4,
  rotation:number = 0,
): Point[] {
  const angle = Math.PI * 2 / vertices
  const points: Point[] = []
  const orientation = Math.PI / vertices // -> pointy top : 0 -> flat top
  rotation = rotation / (Math.PI * 2);
  for (let a = -angle; a < Math.PI * 2 * (1 - 1 / vertices); a += angle) {
      let sx = origin.x + Math.cos(a + orientation + rotation) * radius;
      let sy = origin.y + Math.sin(a + orientation + rotation) * radius;
      points.push({ x: sx, y: sy })
  }
  return points
}