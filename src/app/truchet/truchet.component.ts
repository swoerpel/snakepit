import { Component, OnInit } from '@angular/core';
import * as chroma from 'chroma.ts';
import { scaleLinear, ScaleLinear, scaleLog, select } from 'd3';
import { saveSvgAsPng } from 'save-svg-as-png';
import { uid } from 'uid';
import { ColorService } from '../services/color.service';
import { DrawingService } from '../services/drawing.service';
import { FractalService, TransformParams } from '../services/fractal.service';
import { PointService } from '../services/point-generator.service';
import { QuadTreeService } from '../services/quad-tree.service';
import { QuadTree } from '../services/quadtree';
import { TruchetService } from '../services/truchet.service';
import { WolframService } from '../services/wolfram.service';
import { RangeToggleOutput } from '../shared/components/range-toggle/range-toggle.component';
import { Dims, Point, Rect } from '../shared/models';
import { DrawOptions } from '../shared/models/draw-options.model';
import { StyleOptions } from '../shared/models/style-options.model';
import { arrayRotate, assignRandGridValues, findRectsByValue, generateLine, getHorizontalSinWave, getRadialVertices, pickWeightRandom, randPoint, removeDuplicates, roundPoints, shuffle } from '../state/helpers';
import { WingedTile } from './truchet.models';


// ideas
// draw a 2x2 grid of black and white 2 state patterns
// seperate svgs 

// to use N constant winged tile type,
// create N random wolfram patterns, same seed, different starting pattern
// use pattern sum grid as indexes for winged tile type
// this lets the wolfram pattern stay small
// the other option will be using totalistic

@Component({
  selector: 'app-truchet',
  templateUrl: './truchet.component.html',
  styleUrls: ['./truchet.component.scss']
})
export class TruchetComponent implements OnInit {

  public svg: any;

  public xScale: ScaleLinear<number, number, never>;
  public yScale: ScaleLinear<number, number, never>;

  public colorLight = '#fff9df';
  public colorDark = '#222020';
  // public backgroundColor = this.colorLight;
  public backgroundColor = this.colorDark;
  // public colorDark = 'black';
  // public colorDark = 'white';
  public canvasDims: Dims = {
    width: 600,
    height: 600,
  }
  public canvasGridDims: Dims = {
    width: 1,
    height: 1,
  }

  public cellDims: Dims = {
    width: 9,
    height: 9,
  }

  public gridPadding: Dims = {
    width: 0.1,
    height: 0.1,
  }

  public padding: Point = {
    x: 0.25,
    y: 0.25,
  }

  public points: Point[] = [];

  public rangeValues = [1,2,3,4,6];
  startCircle: Point[];
  endCircle: Point[];

  constructor(
    private wolframService: WolframService,
    private colorService: ColorService,
    private drawingService: DrawingService,
    private quadTreeService: QuadTreeService,
    private truchetService: TruchetService,
    private fractalService: FractalService,
    private pointService: PointService,
  ) { }


  public pointSelected(point: Point){
    const points = getRadialVertices(point,0.2,100)
    // this.points = this.points.concat(points);
    const quadTree: QuadTree = this.quadTreeService.generateQuadTree(points);
    
    this.quadTreeService.drawQuadTreeGridLines(
      quadTree,
      this.svg,
      this.xScale,
      this.yScale,
    );
    this.svg.innerHTML = '';
    // this.drawingService.drawPoints(
    //   this.points,
    //   this.svg,
    //   this.xScale,
    //   this.yScale,
    // );    
  }

  public lineSelected([start,end]: Point[]){
    // this.points = this.points.concat(points);
    // const quadTree: QuadTree = this.quadTreeService.generateQuadTree(points);
    console.log('[start,end',start,end)
    this.drawingService.drawLine(
      start,
      end,
      this.svg,
      this.xScale,
      this.yScale,
      0.05
    );    
  }


  public startCircleSelected(points: Point[]){
    console.log("start points",points)
    this.startCircle = [...points];
    this.drawingService.drawPoints(
      this.startCircle,
      this.svg,
      this.xScale,
      this.yScale,
    ); 
  }
  public endCircleSelected(points: Point[]){
    console.log("end points",points)
    this.endCircle = [...points];
    this.drawingService.drawPoints(
      this.endCircle,
      this.svg,
      this.xScale,
      this.yScale,
    ); 
  }

  public connectCircles(){
    console.log("this.startCircle",this.startCircle);
    console.log("this.endCircle",this.endCircle);
    // each vertex on larger circle to every vertext of smaller circle
    // return array of lines;




    let minPointCircle!: Point[];
    let maxPointCircle!: Point[];
    if(this.startCircle.length > this.endCircle.length){
      maxPointCircle = [...this.startCircle];
      minPointCircle = [...this.endCircle];
    }else{
      maxPointCircle = [...this.endCircle];
      minPointCircle = [...this.startCircle];
    }

    const lines: Point[][] = [];
    maxPointCircle.forEach((pMax: Point) => {
      minPointCircle.forEach((pMin: Point) => {
        lines.push([{...pMin},{...pMax}]);
      })
    })

    this.svg.innerHTML = '';
    lines.forEach(([start,end]: Point[]) => this.drawingService.drawLine(
      start,
      end,
      this.svg,
      this.xScale,
      this.yScale,
      0.04
    ))
    
  }

  ngOnInit(): void {
    this.setupCanvas();
    const cells: Rect[] = this.generateCanvasCells();
    cells.forEach((cell: Rect, i) => {
      //==============================
      // WOLFRAM
      // const kernelParams: KernelParams = {
      //   states: 5,
      //   rule: '',//Math.floor(Math.random() * 50000000),
      //   pattern: [
      //     [1,0,1],
      //     [0,1,0],
      //     [1,0,1],
      //   ]
      // }
      // const grid: Rect[][] = generateDefaultRectGrid(cell,this.cellDims);
      // this.wolframService.assignTotalisticWolframValues(grid,this.cellDims,kernelParams);  
      // let tiles: Rect[] = shuffle(grid.reduce((acc, val) => acc.concat(val), []));
      //==============================
      // CIRCLES
     
      const paramGroup: TransformParams[] = [
        {
            "a": -0.4804788670631335,
            "b": 0.5567376209412149,
            "c": -0.7198754179309135,
            "d": -0.8028900772720047,
            "e": 0.6406432584927539,
            "f": 0.8136326724044154,
            "p": 0.5
        },
        {
            "a": -0.585253702331406,
            "b": 0.8827996515903429,
            "c": 0.08873892754731316,
            "d": -0.3572470977842004,
            "e": -0.5713008337698524,
            "f": -0.620321204843024,
            "p": 0.5
        }
    ]

    // const paramGroup: TransformParams[] = [
    //   {
    //       "a": 0.08973650862065918,
    //       "b": 0.6081066720495298,
    //       "c": -0.04540111549208614,
    //       "d": 0.8700223881677276,
    //       "e": -0.32525229979545967,
    //       "f": -0.4513086464766145,
    //       "p": 0.5
    //   },
    //   {
    //       "a": 0.7061115272560872,
    //       "b": -0.3384537074644909,
    //       "c": 0.6477535747400558,
    //       "d": 0.7540176568680501,
    //       "e": 0.43078949039008463,
    //       "f": 0.18712277280428413,
    //       "p": 0.5
    //   }
    // ];
    const density = 2000;
    const count = 200;

    const points: Point[] = [
        //=======================
        // ...this.pointService.horizontalSinWaveGroup(),
        // ...this.pointService.flower(),
        // ...this.pointService.flower(),
        //=======================
        // ...this.pointService.ellipticCurve(),
        //=======================
        // ...getHorizontalSinWave(
        //   Math.random(),
        //   0.1,
        //   1,
        //   200
        // ),
        //=======================
        // ...getRadialVertices(
        //   {x: 0.75, y: 0.5},
        //   0.4,
        //   density,
        // ),
        // ...getRadialVertices(
        //   {x: Math.random(), y: Math.random()},
        //   0.5,
        //   density,
        // ),
        //=======================
        // ...new Array(count).fill(0).reduce((ary,_,i) => 
        //   ary.concat( generateRandLine(
        //     {x: 0, y: 0},
        //     {x: 1, y: 1},
        //     density,
        //   ),
        // ),[]),
        // ...new Array(count).fill(0).reduce((ary,_,i) => 
        //   ary.concat(getRadialVertices(
        //     {x: 0 + i * 0.01, y: 1 - i*0.01},
        //     i*i*0.1* 0.001,
        //     density + i * 2,
        //   )
        // ),[]),
        //=======================
        // ...generateLine(
        //   {x: 1, y: 1},
        //   {x: 0, y: 0.5},
        //   100,
        // ),
        ...generateLine(
          {x: 0, y: 0.5},
          {x: 1, y: 0},
          50,
        ),
        ...generateLine(
          randPoint(),
          randPoint(),
          50,
        ),
        //=======================
        // ...this.fractalService.generateIFSFractal(null,density)
        // ...this.fractalService.generateIFSFractal(paramGroup,density)
        //=======================
      ];

      const quadTree: QuadTree = this.quadTreeService.generateQuadTree(points);
      this.drawWingedTileGroup(quadTree);
      // this.drawQuadTree(quadTree);
      this.drawPointGroup(points);
    })
  }

  // DRAW POINTS
  public drawPointGroup(points: Point[]): void{
    const colors = this.colorService.createColorList('Oranges',3);
    const rMax = 0.002;
    const rStep = rMax * .6;
    const groupCount = 1;
    // const mods = [1,2,3,4,5];
    
    const opacityOss = (i: number) => {
      const opacities = [1];
      const weights = [1];
      return pickWeightRandom(opacities,weights);
      // const distOpacities = weights.reduce((d,w,i) => d.concat(new Array(w).fill(opacities[i])),[])
      // const op = distOpacities[i % distOpacities.length];
      // console.log('op',op,i);
    }
    points = roundPoints(points);
    // points = removeDuplicates(points,'x'),
    // console.log('points',points);
    for(let i = 0; i < groupCount; i++){
      // const modVal = mods[i % mods.length];
      this.drawingService.drawPoints(
        points,
        // .filter((_,index) => true),
        this.svg,
        this.xScale,
        this.yScale,
        rMax - (rStep * i),
        // colors[i % colors.length],
        // i % 2 === 0 ? this.colorLight : this.colorDark,
        this.colorLight,
        1,//opacityOss,
      );  
    }
  }



  public drawWingedTileGroup(quadTree: QuadTree){
    let tiles: Rect[] = this.quadTreeService.getRectsFromQuadTree(quadTree);
    tiles = [
      ...findRectsByValue(tiles, 2),
      ...findRectsByValue(tiles, 3),
      ...findRectsByValue(tiles, 4),
      ...findRectsByValue(tiles, 5),
      // ...findRectsByValue(tiles, 6),
      // ...findRectsByValue(tiles, 7),
    ]
    const permutationCount = 2;
    assignRandGridValues(tiles,permutationCount,true);
    let wingedTiles: WingedTile[] = this.truchetService.generateWingedTiles(tiles,permutationCount);
    wingedTiles = shuffle(wingedTiles);
    // wingedTiles = wingedTiles.reverse();
    const colorCount = 5;
    const colors = this.colorService.createColorList('random',colorCount);
    // const colors = [this.colorLight,this.colorDark]
    const opcScale = scaleLog().domain([0,1]).range([1,1]);
    const colorOffset = 1 + Math.floor(Math.random() * colorCount);
    wingedTiles.forEach((wingedTile: WingedTile, i: number) => {
      const c1 = colors[i % colors.length];
      const c2 = colors[(i + colorOffset) % colors.length];
      const opacity = opcScale(i / wingedTiles.length);
      this.truchetService.drawWingedTile(
        this.svg,
        this.xScale,
        this.yScale,
        wingedTile,
        c1,c2,
        opacity,
      );
    })
  }

  public drawQuadTree(quadTree: QuadTree){
    console.log('quadtree',quadTree);
    // const swRadio = 0.1;
    const sw = 0.5;
    //  const colorCount = 9;
    // const colors = this.colorService.createColorList('random',colorCount);
    // const strokes = arrayRotate([...colors],Math.floor(colorCount * 0) || 1)
    // console.log(colors)
    const drawOptions: DrawOptions = {
      svg: this.svg,
      xScale: this.xScale,
      yScale: this.yScale,
    }
    const styleOptions: StyleOptions = {
      stroke: 'black',
      fill: 'transparent',
      strokeWidth: sw,
      opacity: 1,
    }
    // this.quadTreeService.drawQuadTreeGridRects(
    //   quadTree,
    //   drawOptions,
    //   styleOptions
    // );
    // this.quadTreeService.drawQuadTreeGridRects(
    //   quadTree,
    //   drawOptions,
    //   styleOptions
    // );
    this.quadTreeService.drawQuadTreeGridLines(
      quadTree,
      this.svg,
      this.xScale,
      this.yScale,
      0,
      this.colorLight,
      this.colorDark,
      0.002,
      1,
      true
    );
  }

  public generateCanvasCells(): Rect[] {
    let cells:Rect[] = [];
    const tWidth = 1 - this.gridPadding.width * 2;
    const tHeight = 1 - this.gridPadding.height * 2;
    const xStep = tWidth / this.canvasGridDims.width;
    const yStep = tHeight / this.canvasGridDims.height;
    for(let row = 0; row < this.canvasGridDims.height; row++){
      for(let col = 0; col <  this.canvasGridDims.width; col++){
        cells.push({
          x: this.gridPadding.width + col * xStep,
          y: this.gridPadding.height + row * yStep,
          width: xStep,
          height: yStep,
        });
      }
    }
    return cells;
  }

  drawGrid(grid: Rect[][], states: number){
    const flatGrid: Rect[] = grid.reduce((acc, val) => acc.concat(val), []);
    // console.log('flatGrid',flatGrid)
    const cm = chroma.scale(['black','white']);
    const gridGroup = this.svg.append('g').selectAll('rect').data(flatGrid);
    gridGroup.enter()
      .append('rect')
      .attr('x', d => this.xScale(d.x))
      .attr('y', d => this.yScale(d.y))
      .attr('width', d => this.xScale(d.width))
      .attr('height', d => this.yScale(d.width))
      .attr('fill', d => cm(d.value / (states - 1)).hex())
  }

  public setupCanvas(){
    this.xScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.width]);
    this.yScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.height]);
    this.svg = select('#canvas')
      .append("svg")
      .attr('width', this.canvasDims.width)
      .attr('height', this.canvasDims.height)
      .style('background-color',this.backgroundColor);
  }

  // public setupCanvasTile(): void{
  //   this.xScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.width]);
  //   this.yScale = scaleLinear().domain([0,1]).range([0,this.canvasDims.height]);
  //   this.svg = select('#canvas')
  //     .append("svg")
  //     .attr('width', this.canvasDims.width)
  //     .attr('height', this.canvasDims.height)
  //     .style('background-color','black');
  // }

  public save(){
    let svg = document.getElementsByTagName("svg")[0];
    let id = `${uid()}.png`;
    console.log('svg',id,svg);
    let params = {backgroundColor: this.backgroundColor, scale: 3};
    saveSvgAsPng(svg,id,params);
  }

}
