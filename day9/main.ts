import { fillArray } from "../utils/arrayutils.ts";
import { readfile, readlines, splitlines, writefile } from "../utils/fileutils.ts";
import { Grid } from "../utils/grid.ts";
import { Point } from "../utils/point.ts";


const Tile = {
    EMPTY: '.',
    GREEN: '#',
    RED: 'X'
} as const;
type Tile = (typeof Tile)[keyof typeof Tile];

function getarea(p:Point, q :Point){
    return (Math.abs(p.x-q.x)+1) *(Math.abs(p.y-q.y)+1);
}

//Aproximates the grid down using a scaling factor so that it can be printed to a file and manually inspected.
function aproximate(p:Point, aprox:Grid<Tile>, last_point?:Point, factor:number=100):Point{
    let aproxPoint :Point = new Point(Math.round(p.x/100),Math.round(p.y/100));
    aprox.setPoint(aproxPoint,Tile.RED);
    if(last_point){
        if(aproxPoint.x == last_point.x)
        {
            let start = Math.min(last_point.y,aproxPoint.y)
            let end = Math.max(last_point.y,aproxPoint.y)
            for(let y= start+1; y < end; y++){
                aprox.set(aproxPoint.x,y,Tile.GREEN)
            }
        } else if (aproxPoint.y == last_point.y){
            let start = Math.min(last_point.x,aproxPoint.x)
            let end = Math.max(last_point.x,aproxPoint.x)
            for(let x= start+1; x < end; x++){
                aprox.set(x,aproxPoint.y,Tile.GREEN)
            }
        } else{
            throw new Error("this should be impossible, we probably have some rounding error")
        }
    }
    return aproxPoint;

}

/**
 * checks if for a given range of numbers, a given value is both below a set of maximums and beneath a set of minimum values.
 * @param start the first index into the constrain arrays to check
 * @param end the first index into the constraint arrays that is not checked. i.e. checks happen from start inclusive to end exclusive
 * @param comparevalue a value to compare against
 * @param minvalues an array of minimum values
 * @param maxvalues an array of maximum values
 * @returns wether maxvalue[i] > comaprevalue > minvalues[i] for all i between start and end
 */
function checkline(start:number,end:number,comparevalue:number, minvalues:number[],maxvalues:number[]):boolean{
    for(let i = start; i< end; i++){
        // if(minvalues[i] === undefined || minvalues[i] === 9999)
        if(minvalues[i] > comparevalue || maxvalues[i] < comparevalue){
            return false
        }
    }
    return true;
}

function checkforgreen(corner:Point, othercorner:Point, xposlim:number[],xneglim:number[],yposlim:number[],yneglim:number[]):boolean{
    let topleftx = Math.min(corner.x,othercorner.x);
    let toplefty = Math.max(corner.y,othercorner.y);
    let botrightx = Math.max(corner.x,othercorner.x);
    let botrighty = Math.min(corner.y,othercorner.y);
    return  checkline(topleftx+1, botrightx, toplefty, yneglim, yposlim) &&
            checkline(botrighty+1, toplefty, botrightx, xneglim, xposlim) &&
            checkline(topleftx+1, botrightx, botrighty, yneglim, yposlim) &&
            checkline(botrighty+1, toplefty, topleftx, xneglim, xposlim) 
}

let input : Point[] = readlines("user.txt",9).map(l=>l.split(',')).map(([x,y])=> new Point(x,y))
// let gridaproximation: Grid<Tile> = Grid.buildGrid(Tile.EMPTY,1000,1000);
// let last_point:Point = new Point(Math.round(input.at(-1)!.x/100),Math.round(input.at(-1)!.y/100));
//We could be smart, but with only 500ish points the brute force way works just fine.
let maxarea = 0;
let maxrestrictedarea=0;
// let minx = 10000;
// let maxx = 0;
// let miny = 10000;
// let maxy = 0;

//A rough over-estimation of the size of the tile grid
const GRIDRANGE: number = 100000;
// The higest and lowest x and y positions that are still green or red in a given column or row
let xposExtremities = fillArray(GRIDRANGE,Number.MIN_SAFE_INTEGER)
let yposExtremities = fillArray(GRIDRANGE,Number.MIN_SAFE_INTEGER)
let xnegExtremities = fillArray(GRIDRANGE,Number.MAX_SAFE_INTEGER)
let ynegExtremities = fillArray(GRIDRANGE,Number.MAX_SAFE_INTEGER)
let lastextremitiespoint: Point = input.at(-1)!
for(let i = 0; i < input.length; i++){
    let newpoint = input[i]
    xposExtremities[newpoint.y] = Math.max(xposExtremities[newpoint.y],newpoint.x)
    xnegExtremities[newpoint.y] = Math.min(xnegExtremities[newpoint.y],newpoint.x)
    yposExtremities[newpoint.x] = Math.max(yposExtremities[newpoint.x],newpoint.y)
    ynegExtremities[newpoint.x] = Math.min(ynegExtremities[newpoint.x],newpoint.y)
     if(newpoint.x == lastextremitiespoint.x)
        {
            let start = Math.min(lastextremitiespoint.y,newpoint.y)
            let end = Math.max(lastextremitiespoint.y,newpoint.y)
            for(let y= start+1; y < end; y++){
                xposExtremities[y] = Math.max(xposExtremities[y],newpoint.x)
                xnegExtremities[y] = Math.min(xnegExtremities[y],newpoint.x)
            }
        } else if (newpoint.y == lastextremitiespoint.y){
            let start = Math.min(lastextremitiespoint.x,newpoint.x)
            let end = Math.max(lastextremitiespoint.x,newpoint.x)
            for(let x= start+1; x < end; x++){
                yposExtremities[x] = Math.max(yposExtremities[x],newpoint.y)
                ynegExtremities[x] = Math.min(ynegExtremities[x],newpoint.y)
            }
        } else{
            throw new Error("this should be impossible, we probably have some rounding error")
        }

    lastextremitiespoint  = newpoint;
}

let maxrestrictedloc :[Point,Point] = [input[0],input[0]];
for(let i = 0; i < input.length; i++){
    // minx = Math.min(minx,input[i].x);
    // maxx = Math.max(maxx,input[i].x);
    // miny = Math.min(miny,input[i].y);
    // maxy = Math.max(maxy,input[i].y);
    // last_point = aproximate(input[i],gridaproximation,last_point,100)


    for(let j = i+1; j<input.length; j++){
        let newarea = getarea(input[i],input[j]);
        maxarea = Math.max(maxarea,newarea);
        if(checkforgreen(input[i],input[j],xposExtremities,xnegExtremities,yposExtremities,ynegExtremities)){
            // console.log(`found a valid area of size ${newarea}`)
            if(newarea > maxrestrictedarea){
                // console.log(`updating estimate of largest restricted area to ${newarea}`);
                maxrestrictedloc = [input[i],input[j]]
                maxrestrictedarea = newarea;
            }
        }
    }
}

console.log(`The biggest rectangle has an area of ${maxarea}`);
console.log(`The biggest rectangle only over green and red is actually just ${maxrestrictedarea}`)
console.log(`it is located at ${maxrestrictedloc[0]} and ${maxrestrictedloc[1]} `)
// console.log(`The field is bounded by ${minx},${miny} and ${maxx},${maxy}`)
// console.log(`An attempt at grid approximation written to file`)
// writefile('gridaprox.txt',gridaproximation.toString(),9)

//current wrong output:
// The biggest rectangle only over green and red is actually just 4663164642
// it is located at 16535,84972 and 82492,14274 
