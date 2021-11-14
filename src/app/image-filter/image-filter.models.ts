import { Point } from "../shared/models";
  

export interface ColorGL{
    red: number;
    green: number;
    blue: number;
}
  
export interface ColorHSL{
    hue: number;
    saturation: number;
    lightness: number;
}
  
export interface Cell{
    col: number; // x
    row: number; // y

    rgb?: string;
    hex?: string;
    lum?: number;
    gl_red?: number;
    gl_green?: number;
    gl_blue?: number;
    hsl_hue?: number;
    hsl_saturation?: number;
    hsl_lightness?: number;

    index: number;
    origin: Point;
    value?: number;
    state?: CellState;

    width?: number;
    height?: number;
}

export enum CellState{
    Open = 'Open',
    Closed = 'Closed',
}
  
export interface Knight{
    position: Point;
    jumpVector: Point;
    path: Cell[];
}



export interface Weave{
    length: number;
    groupLengthScaler: number;
    startWidth: number;
    palette: string | string[];
    colorCount: number;
    opacity: number;
  }
  
  export interface WeaveGroup{
    width: number;
    color: string;
    points: Point[];
    length: number;
    opacity: number;
  }

