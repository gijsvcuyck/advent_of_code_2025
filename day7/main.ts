import { readfile, readlines, splitlines } from "../utils/fileutils.ts";
import { Grid } from "../utils/grid.ts";

const TachyonField = {
    EMPTY: '.',
    SPLITTER: '^',
    BEAM: '|',
    START: 'S'
} as const;
type TachyonField = (typeof TachyonField)[keyof typeof TachyonField];

function parsefield(f: string): TachyonField {
    const values: string[] = Object.values(TachyonField);
    if (values.includes(f)) {
        return f as TachyonField
    } else {
        throw new Error(`${f} is not a valied Field`);
    }
}

let input: TachyonField[][] = readlines("user.txt",7).map(l=>l.split("").map(parsefield));
let beamxs: [number,number][] = [[input[0].findIndex(f => f=== TachyonField.START),1]];
let grid : Grid<TachyonField>= new Grid(TachyonField.EMPTY,input);
let beamsplitcounter : number = 0;
for(let y = 1; y< input.length; y++)
{
    let newbeamxs:[number,number][]  = [];
    beamxs.forEach(([x,c]) => {
        let targetfield :TachyonField = grid.get(x,y)
        if(targetfield=== TachyonField.EMPTY){
            grid.set(x,y,TachyonField.BEAM)
            newbeamxs.push([x,c]);
        } else if(targetfield === TachyonField.SPLITTER){
            let splitleftind = newbeamxs.findIndex(([beamx,c]) => beamx === x-1)
            let splitrightind= newbeamxs.findIndex(([beamx,c]) => beamx === x+1)
            if(splitleftind>=0){
                newbeamxs[splitleftind][1]+=c
            } else{
                newbeamxs.push([x-1,c]);
                grid.set(x-1,y,TachyonField.BEAM) 
            }
            if(splitrightind>=0){
                newbeamxs[splitrightind][1]+=c
            } else{
                newbeamxs.push([x+1,c]);
                grid.set(x+1,y,TachyonField.BEAM) 
            }
            beamsplitcounter++
        } else if (targetfield === TachyonField.BEAM){
            newbeamxs[newbeamxs.findIndex(([beamx,c]) => beamx === x)][1]+=c
        }
        else{
            throw new Error("unreachable code reached in splitter calc: found field " + targetfield)
        }
    })
    beamxs = newbeamxs;
}

//should be 1675
console.log(`total beam count: ${beamsplitcounter}`);
let quantumbeamcounter : number = beamxs.map(([x,c])=> c).reduce((x,y)=> x+y,0);
console.log(`the quantum people might however claim that there were really ${quantumbeamcounter} beams`);


