import { readfile, readlines } from "../utils/fileutils.ts";
import { Grid } from "../utils/grid.ts";

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



