import { readfile, readlines } from "../utils/fileutils.ts";

let totalaccumulator: number = 0;
let accumulator:number = -1;


// A first attempt at making an enum.
// It works, but I dont think you can add methods or interface implementations to this, as it would break the following type definition.
const PaperField = {
    EMPTY: '.',
    PAPER: '@',
    MARKED: 'X'
} as const;
type PaperField = (typeof PaperField)[keyof typeof PaperField];

function parsefield(f: string): PaperField {
    const values: string[] = Object.values(PaperField);
    if (values.includes(f)) {
        return f as PaperField
    } else {
        throw new Error(`${f} is not a valied Field`);
    }
}

/**
 * A two dimensional grid of elements.
 * Access works with the get and set methods, which both protect against out of bound acess.
 * Any out of bound acess will instead result in the 'default element', supplied using the constructor.
 * 
 */
class Grid<FieldT> {
    // the field, stored as an array of rows, so grid[y][x] gets a logical point.
    grid: FieldT[][];
    default_elem: FieldT;

    constructor(default_elem: FieldT, grid?: FieldT[][]) {
        this.grid = grid ?? [];
        this.default_elem = default_elem;
    }


    get(x: number, y: number): FieldT {
        if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[y].length) {
            return this.default_elem
        } else {
            return this.grid[y][x]
        }
    }

    set(x: number, y: number, val: FieldT) {
        if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[y].length) {
            return;
        } else {
            this.grid[y][x] = val;
        }
    }

    printfield() {
        this.grid.forEach(row => console.log(row));
    }

    /**
     * 
     * @returns the length of the first row of this grid
     */
    getwidth(): number {
        return this.grid[0].length ?? 0
    }

    /**
     * 
     * @returns the number of rows in this grid
     */
    getheight(): number {
        return this.grid.length

    }

    /**
     * Performs an in-place mapping by applying f to each element of the grid, and then replacing the element with the result.
     * @param f a mapping function
     */
    transform(f : (x:FieldT) => FieldT){
        for (let y = 0; y< this.getheight(); y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                this.grid[y][x] = f(this.grid[y][x])
            }
        }
    }

}

function isAproachable(grid: Grid<PaperField>, x: number, y: number):boolean {
    let counter = 0;
    if(grid.get(x,y) === PaperField.EMPTY){return false}
    for (let ix = x - 1; ix <= x + 1; ix++) {
        for (let iy = y - 1; iy <= y + 1; iy++) {
            if (grid.get(ix, iy) == PaperField.EMPTY) {
                counter++
            }
        }

    }
    return counter > 4;
}



let rawinput: PaperField[][] = readlines("user.txt", 4).map(l => l.split("").map(f => parsefield(f)));
let input: Grid<PaperField> = new Grid(PaperField.EMPTY, rawinput);
let first = true;
while(accumulator !== 0){
    accumulator = 0;
    for (let x = 0; x < input.getwidth(); x++) {
        for (let y = 0; y < input.getheight(); y++) {
            if (input.get(x,y) == PaperField.MARKED){

            }
            if (isAproachable(input, x, y)) {
                accumulator++;
                // console.log(`found movable roll at: ${x},${y}`);
                input.set(x,y,PaperField.MARKED);
            }
        }
    }
    if(first){
        first = false;
        console.log(`initial movable paper rolls: ${accumulator}`);
    }
    totalaccumulator+=accumulator;
    input.transform(e => e === PaperField.MARKED ? PaperField.EMPTY : e)
}

console.log(`total movable paper rolls: ${totalaccumulator}`);



