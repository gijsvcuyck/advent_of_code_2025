import { readfile, readlines, splitlines, writefile } from "../utils/fileutils.ts";


class Tree{
    width:number;
    height:number;
    presents:number[];

    constructor(inputline:string){
        let [dimensions,presents_string] = inputline.split(": ")
        let [widthstring,heightstring] = dimensions.split("x");
        this.width = Number(widthstring)
        this.height = Number(heightstring)
        this.presents = presents_string.split(' ').map(p=> Number(p))

    }

    getsize():number{
        return this.width*this.height
    }

    willFitIffDisassemble(presentlist:Present[]){
        let size = this.presents.map((count,pId)=>count*presentlist[pId].size).reduce((left,right)=> left+right,0)
        let result =  size <= this.getsize()
        return result
    }

    willFitWithoutPacking(presentlist:Present[]){
        let presentcount = this.presents.reduce((x,y)=>x+y,0)
        let threeByThrees = Math.floor(this.height/3)*Math.floor(this.width/3)
        return presentcount <= threeByThrees;
    }
}

class Present{
    id:number;
    shape:boolean[][]
    size:number

    constructor(presentstring:string){
        let lines = presentstring.split(/\r?\n/)
        this.id = Number(lines.at(0)?.split(":").at(0))
        this.shape = []
        lines.slice(1).forEach(line=>{
            let row = Array.from(line).map(c=> c=== '#')
            this.shape.push(row)
        })
        this.size=0;
        this.shape.forEach(l=>{
            l.forEach(p=>{
                this.size+= p?1:0
            })
        })
    }
}

let input = readfile('user.txt',12).split(/\r?\n\r?\n/)
let presents:Present[] = input.slice(0,-1).map(s=>new Present(s));
let trees:Tree[] = input.at(-1)?.split(/\r?\n/).map(l=>new Tree(l))!;
let fitcount = 0
let wrongcount = 0
let maybecount = 0
trees.forEach((t,i)=>{
    let result = t.willFitIffDisassemble(presents)
    let definitefit = t.willFitWithoutPacking(presents);
    if(definitefit){
        console.log(`tree ${i} will definately fit`)
        fitcount++
    }
    else if(result){
        console.log(`tree ${i} might fit using incredibly rough estimation and present handling`)
        maybecount++
    }else{
        console.log(`tree ${i} will not fit`)
        wrongcount++
    }
})

console.log(`there are between ${fitcount} and ${fitcount+maybecount} fitting trees. ${wrongcount} trees will definately not fit`)