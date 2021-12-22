import { Injectable } from '@angular/core';
import { Point } from '../shared/models';
import { getHorizontalSinWave, getRadialVertices } from '../state/helpers';

@Injectable({providedIn: 'root'})
export class PointService {
    constructor() { }
    

    generateLine(start: Point, end: Point, count = 5): Point[]{
        const points: Point[] = [];
        const dx = (end.x - start.x) / (count - 1)
        const dy = (end.y - start.y) / (count - 1)
        for(let i = 0; i < (count - 1); i++){
            points.push({
                x: start.x + i * dx,
                y: start.y + i * dy,
            })
        }
        points.push(end);
        return points;
    }

    horizontalSinWaveGroup(): Point[]{
        const waveCount = 600;
        const waveDensity = 100;
        const waves: Point[][] = [];
        let yStep = 0.0;
        let aStep = 0.035;
        let fStep = 0;
        let y = 0.1 - 4;
        let a = 0;
        let f = 0.5;
        for(let i = 0; i < waveCount; i++){
            
            waves.push(getHorizontalSinWave(
                y + yStep * i,
                0.8,
                a + aStep * i,
                f + fStep * i,
                waveDensity
            ))
        }
        return [].concat.apply([], waves)
    }

    flower(): Point[]{
        let origin: Point = {
            x: 0.5,
            y: 0.5,
        }
        const ringCount = 50;
        const rMax = 0.49;
        const rMin = 0.08;
        const rStep = (rMax - rMin) / ringCount;
        const vMin = ringCount + 8;
        const vStep = -1;
        // console.log("rStep",rStep);
        let points = [];
        for(let i = 0; i < ringCount; i++){
            const radius = rMin + i * rStep;
            const vertices = vMin + i * vStep;
            origin = {...origin}
            points = points.concat(getRadialVertices(origin, radius, vertices))
        }
        // console.log("points",points);
        return points;
    }

    ellipticCurve(): Point[]{
        let origin: Point = {
            x: 0.5,
            y: 0.5,
        }
        const points = [];

        const A = 2.2;
        const B = 1;
        const C = 1;
        const D = 0;
        const E = 1;
        const F = 1;
        const f = (x) => Math.sqrt(
            A * Math.pow((x - F),3) - 
            B * (x - F) + C
        ) - D;

        const steps = 10
        const stepSize = 1 / steps;
        for(let i = 0; i < steps; i++){
            const x = stepSize * i;
            points.push({
                x: origin.x + x,
                y: origin.y - f(x),
            })
        }

        return points;
    }

}