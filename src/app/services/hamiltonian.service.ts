import { Injectable } from '@angular/core';
import { Dims, Point } from '../shared/models';


enum Direction{
    North = 'North',
    South = 'South',
    East = 'East',
    West = 'West',
}

@Injectable({providedIn: 'root'})
export class HamiltonianService {


    constructor() {}


    findHamiltionanPath(dims: Dims): number[][]{
        let pathLength: number = 0;
        let valueGrid: number[][];
        let count = 0;
        while((pathLength !== (dims.width * dims.height))){
          const res = this.findPath(dims);
          valueGrid = res[0];
          pathLength = res[1];
          count++;
        }
        return valueGrid;
    }

    findPath(dims: Dims): [number[][],number]{

        // create new grid of numbers 
        let grid = []
        for(let i = 0; i < dims.height; i++){
            let row = []
            for(let i = 0; i < dims.height; i++){
                row.push(0);
            }
            grid.push(row);
        }

        // choose random starting point
        let p: Point = {
            x: Math.floor(Math.random() * dims.width),
            y: Math.floor(Math.random() * dims.height),
        }

        let path: Point[] = [{...p}];
        grid[p.y][p.x] = 1;
        
        // console.log("starting point",p);
        // console.log("grid",grid);

        let blocked = false;
        while(!blocked){
            let directions = Object.values(Direction);
            let directionNotFound = true;
            let prevPathLength = path.length;
            while(directions.length > 0 && directionNotFound){
                let dirIndex = Math.floor(Math.random() * directions.length);
                let dir = directions.splice(dirIndex, 1)[0];
                let x = p.x;
                let y = p.y;
                switch(dir){
                    case Direction.North: {
                        y = y + 1;
                    }; break;
                    case Direction.South: {
                        y = y - 1;
                    }; break;
                    case Direction.East: {
                        x = x + 1;
                    }; break;
                    case Direction.West: {
                        x = x - 1;
                    }; break;
                }
                try{
                    if(grid[y][x] === 0){
                        directionNotFound = false;
                        p = {x,y};
                        path.push({...p});
                        grid[y][x] = path.length;
                    }
                }catch { }
            }

            if(path.length === prevPathLength){
                blocked = true;
                // console.log("grid",grid);
                // console.log("path",path);
            }
        }
        return [grid,path.length];
    }
    
}