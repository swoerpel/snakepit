import { Dims, Extrema, Point, Range, Rect } from "../shared/models";


export function flatten<T>(grid: T[][]):T[]{
  return grid.reduce((acc, val) => acc.concat(val), []);
}

export var round = (N,decimals = 6) => {
  return parseFloat(N.toFixed(decimals));  
}

export var removeDuplicates = <T>(arr: T[],key: string = 'id'): T[] => 
  arr.filter((v,i,a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i)


export var randHex = (): string => {
  return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}

export var randPoint = (scaler = 1): Point => ({
  x: Math.random() * scaler,
  y: Math.random() * scaler,
})

export var getExtremaFromPoints = (points: Point[]): Extrema[] => {
  return [
    points.reduce((extrema: Extrema, {x}: Point) => {
      if(x > extrema.max){
        return {...extrema, max: x};
      }
      if(x < extrema.min){
        return {...extrema, min: x};
      }
      return extrema;
    },{min: points[0].x, max: points[0].x}),

    points.reduce((extrema: Extrema, {y}: Point) => {
      if(y > extrema.max){
        return {...extrema, max: y};
      }
      if(y < extrema.min){
        return {...extrema, min: y};
      }
      return extrema;
    },{min: points[0].y, max: points[0].y})
  ];
}


export function roundPoints(points: Point[], decimals: number = 6): Point[]{
  return points.map((p) => ({
    x: round(p.x,decimals),
    y: round(p.y,decimals),
  }))
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

export function shuffle<T>(array: T[]): T[] {
  var currentIndex = array.length,  randomIndex;
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


export function generateDefaultRectGrid(rect: Rect, dims: Dims, value = 0):Rect[][] {
  const grid: Rect[][] = [];
  const xStep = rect.width / dims.width;
  const yStep = rect.height / dims.height;
  for(let row = 0; row < dims.height; row++){
    const rectRow: Rect[] = [];
    for(let col = 0; col <  dims.width; col++){
      rectRow.push({
        x: round(rect.x + col * xStep),
        y: round(rect.y + row * yStep),
        width: round(rect.width) / dims.width,
        height: round(rect.height) / dims.height,
        value,
      })
    }
    grid.push(rectRow);
  }
  return grid;
}

export function assignRandGridValues (rects: Rect[], scaler = 1, floor = false): void{
  rects.forEach((rect: Rect) => {
    let value = Math.random() * scaler;
    if(floor){
      value = Math.floor(value);
    }
    return {...rect,value}
  })
}

export function findRectsByValue(rects: Rect[],value: number,invert = false): Rect[]{
  return rects.filter((rect: Rect) => {
    if(invert){
      return rect.value !== value;
    }else{
      return rect.value === value;
    }
  })
}


export function pickWeightRandom<T>(values: T[], weights: number[] = [1]): T {
  const weightedValues = weights.reduce((d,w,i) => 
    d.concat(new Array(w).fill(values[i])),[]);
  return weightedValues[Math.floor(Math.random() * weightedValues.length)];
}


export const splitRectsByIndex = (
  rects: Rect[], 
  splitIndexes: number[], 
  permutations: number[] = [0]
): Rect[] => {
  const newRects: Rect[] = []
  const width = rects[0].width / 2;
  const height = rects[0].height / 2;
    // console.log('value',values)
  splitIndexes.forEach((rectIndex: number, i: number) => {
    const rect = rects[rectIndex];
    // const value = permutations[i % permutations.length];
    const values: number[] = new Array(4).fill(0).map(() => 
      permutations[Math.floor(Math.random() * permutations.length)]);
    console.log('values',values)
    newRects.push({x: rect.x,y: rect.y,width,height, value: values[0]});
    newRects.push({x: rect.x + width, y: rect.y, width,height,value: values[1]});
    newRects.push({x: rect.x + width, y: rect.y + height, width, height,value: values[2]});
    newRects.push({x: rect.x, y: rect.y + height, width, height,value: values[3]});
  })
  return newRects;
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

export function getHorizontalSinWave(
  y: number = 0.5,
  width: number = 1,
  amplitude: number = 0.25,
  frequency: number = 1, 
  density: number = 200
): Point[] {
  let step = 1 / density * width;
  let points: Point[] = []
  for(let i = 0; i < density; i ++){
    let x = i * step  + (1 - width) / 2;
    points.push({
      x: x,
      y: y + amplitude * Math.sin(x * frequency * 2 * Math.PI)
    })
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
  rotation = rotation * Math.PI / 180;
  for (let a = -angle; a < Math.PI * 2 * (1 - 1 / vertices); a += angle) {
      let sx = origin.x + Math.cos(a + orientation + rotation) * radius;
      let sy = origin.y + Math.sin(a + orientation + rotation) * radius;
      points.push({ x: round(sx), y: round(sy) })
  }
  return points
}

export function generateRadialCurve(point: Point, origin: Point, rotation = 90): Point[] {    
  const points = [];
  const pointCount = 90;
  const angleStep = rotation / pointCount;
  for(let i = 0; i <= pointCount; i++){
    const radians = (Math.PI / 180) * angleStep * i;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const x = (cos * (point.x - origin.x)) + (sin * (point.y - origin.y)) + origin.x;
    const y = (cos * (point.y - origin.y)) - (sin * (point.x - origin.x)) + origin.y;
    points.push({x,y});
  }
  return points;
}

export function generateLine(p1: Point,p2: Point,segments = 10): Point[] {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const xStep = dx / segments;
  const yStep = dy / segments;
  const points = [{...p1}];
  for(let i = 0; i < segments; i++){
    const x = p1.x + xStep * i;
    const y = p1.y + yStep * i;
    points.push({x,y});
  } 
  return points;

}

export function generateRandLine(
  min: Point = {x: 0, y: 0},
  max: Point = {x: 1, y: 1},
  segments = 10
): Point[] {
  const p1 = {
    x: min.x + (max.x * Math.random()),
    y: min.y + (max.y * Math.random()),
  };
  const p2 = {
    x: min.x + (max.x * Math.random()),
    y: min.y + (max.y * Math.random()),
  };
  return generateLine(p1,p2,segments);
}