// possible curves in order
// 0: left -> down
// 1: up -> right
// 2: left -> up
// 3: down -> right
// possible straights in order
// 0: left -> right
// 1: up -> down
export const TILE_MAP: Record<string, {curves: number[], straights: number[]}> = {
    a: {
        curves: [1,1,0,0],
        straights: [0,0],
    },
    b: {
        curves: [0,0,1,1],
        straights: [0,0],
    },
    c: {
        curves: [0,0,0,0],
        straights: [1,0],
    },
    d: {
        curves: [0,0,0,0],
        straights: [0,1],
    },
    e: {
        curves: [0,0,0,0],
        straights: [0,0],
    },
    f: {
        curves: [1,1,1,1],
        straights: [1,1],
    },
    g: {
        curves: [0,0,0,0],
        straights: [1,1],
    },
    h: {
        curves: [1,0,0,0],
        straights: [0,0],
    },
    i: {
        curves: [0,1,0,0],
        straights: [0,0],
    },
    j: {
        curves: [0,0,1,0],
        straights: [0,0],
    },
    k: {
        curves: [0,0,0,1],
        straights: [0,0],
    },
    // 
    l: {
        curves: [0,1,1,0],
        straights: [1,0],
    },
    m: {
        curves: [0,1,0,1],
        straights: [1,0],
    },
    n: {
        curves: [1,0,0,1],
        straights: [0,1],
    },
    o: {
        curves: [1,0,1,0],
        straights: [0,1],
    }
}
