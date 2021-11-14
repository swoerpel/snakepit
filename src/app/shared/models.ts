export interface Rect{
    x: number;
    y: number;
    width: number;
    height: number;
    value?: number;
    fill?: number;
}

export interface Dims{
    width: number;
    height: number
}

export interface Range{
    low: number;
    high: number;
}

export interface Point{
    x: number;
    y: number;
}

export interface ColorPalette {
    name: string;
    colors: string[];
}