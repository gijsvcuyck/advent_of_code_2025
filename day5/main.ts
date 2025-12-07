import { readfile, readlines, splitlines } from "../utils/fileutils.ts";

let accumulator:number = 0;


class Range {
    start:number;
    end:number;

    constructor(start: number|string,end: number|string){
        this.start = Number(start);
        this.end = Number(end);
    }

    checkIfValid(id:number):boolean {
        return id >= this.start && id <= this.end;
    }

    checkOverlap(range:Range){
        return (range.start >= this.start && range.start <= this.end) ||
                (range.end <= this.end && range.end >= this.start)
    }

    /**
     * merges two ranges, in place. This will only work if the two ranges overlap, but this is not checked here.
     * @param range update this range to also include the valid ids from range
     */
    merge(range:Range){
        this.start = Math.min(this.start,range.start);
        this.end = Math.max(this.end,range.end);
    }

    getlength(){
        return (this.end -this.start) +1
    }

    toString(){
        return `${this.start}-${this.end}`
    }
}

let [rawfreshlist, rawingredients] = readfile("user.txt",5).split(/\r?\n\r?\n/);
let freshlist : Range[]= splitlines(rawfreshlist).map(l => {let [start,end] = l.split("-"); return new Range(start,end)});
let ingredients : number[] = splitlines(rawingredients).map(l => Number(l));
let result = ingredients.reduce((acc,ingredient) => freshlist.findIndex(range => range.checkIfValid(ingredient)) === -1? acc : acc+1,0);

let mergedfreshlist :Range[] = [];
freshlist.sort((x,y) => x.start < y.start ? -1 : 1)
freshlist.forEach(range => {
    let index = mergedfreshlist.findIndex(r => r.checkOverlap(range))
    if(index === -1){
        mergedfreshlist.push(range);
    } else{
        mergedfreshlist[index].merge(range);
    }
});
let freshcount = mergedfreshlist.reduce((count,range)=> count+range.getlength(),0)
// console.log(`the optimised ingredient freshlist:\n ${mergedfreshlist.toString()}`)
console.log(`total number of availiable fresh ingredients: ${result}`)
console.log(`total number of fresh ingredients: ${freshcount}`)



