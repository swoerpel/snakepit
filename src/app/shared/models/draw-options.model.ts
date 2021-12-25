import { ScaleLinear } from "d3";

export interface DrawOptions{
    svg: any;
    xScale: ScaleLinear<number, number, never>;
    yScale: ScaleLinear<number, number, never>;
}
