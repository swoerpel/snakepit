import { Dims } from "../shared/models";
import { Cell } from "../state/studio.models";

export enum GridAlgorithmType {
    Constant = 'Constant',
    Random = 'Random',
    Simple = 'Simple',
    Complex = 'Complex',
}

export const defaultGrid = (dims: Dims): Cell[] => {
    const cells: Cell[] = []
    for(let i = 0; i < dims.height; i++){
        for(let j = 0; j < dims.width; j++){
            cells.push({
                x: j / dims.width, 
                y: i / dims.height, 
                i,
                j,
                value: 0
            })
        }
    }
    return cells;
}

export const gridAlgorithms = {
    [GridAlgorithmType.Constant]: {
        constant: (dims: Dims, value: number) => defaultGrid(dims).map(c => ({...c, value: value - 1}))
    },
    [GridAlgorithmType.Random]: {
        random: (dims: Dims, base: number) => defaultGrid(dims).map(c => ({...c, value: Math.floor(Math.random() * base)}))
    },
    [GridAlgorithmType.Simple]: {
        checker: (dims: Dims, base: number) => defaultGrid(dims).map((cell: Cell, i) => ({...cell, value: i % base})),
        rows: (dims: Dims, base: number) => defaultGrid(dims).map((cell: Cell) => ({...cell, value: cell.i % base})),
        columns: (dims: Dims, base: number) => defaultGrid(dims).map((cell: Cell) => ({...cell, value: cell.j % base}))
    }
}