import { Dims } from "../shared/models";



export interface GridLayer{
    index: number;
    display: boolean;
    opacity: number;
    dims: Dims;
    algorithm: GridAlgorithm;
    algorithmParams: AlgorithmParams;
    colorPalette: string;
    activeColors: string[];
}

export interface AlgorithmParams {
    maxValue: number;
}

export enum GridAlgorithm {
    Random = 'Random',
    Modulus = 'Modulus',
}



// V3 =====================

export interface Cell{
    x: number;
    y: number;
    i: number;
    j: number;
    value: number;
}

export interface Layer{
    opacity: Cell[];
    size: Cell[];
    shape: Cell[];
    color: Cell[];
    split?: Cell[];
    rotation?: Cell[];
}

export interface LayerCell{
    x: number;
    y: number;
    i: number;
    j: number;
    opacity: number;
    size: number;
    shape: number;
    color: number;
    split?: number;
    rotation?: number;
}