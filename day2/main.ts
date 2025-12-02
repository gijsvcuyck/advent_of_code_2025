import {readfile, readlines } from "../fileutils.ts";

// the hello world program
console.log('Hello World');
let accumulator : number = 0;
let accumulator2 : number = 0;
function checkid(id: string){
    if (id.length%2!== 0){return;}
    const midway :number = id.length/2;
    for(let i:number =0; i<midway; i++){
        if(id[i] !== id[midway+i]) {return;}
    }
    // console.log("found invalid id: " + id);
    accumulator+=Number(id);
}

function checkid_v2(id:string){
    const midway :number = id.length/2;
    outer: for(let i:number =1; i<=midway; i++){
        if (id.length%i !== 0){continue}
        const pattern = id.slice(0,i);
        for(let j = i; j<=id.length-i; j+=i){
            if (pattern !== id.slice(j,j+i)){
                continue outer;
            }
        }
        // console.log("found invalid id: " + id);
        accumulator2+=Number(id);
        break;
    }
}

function handle_range_dumb_v2(start:string, end:string){
    // console.log("now handling dumb range from " + start + " to " + end);
    const startn :number = Number(start);
    const endn :number = Number(end);
    for (let i=startn; i<=endn;i++){
        checkid_v2(i.toString());
    }
    // console.log("finished dumb range from " + start + " to " + end);
}

function handle_range_dumb(start:string, end:string){
    // console.log("now handling dumb range from " + start + " to " + end);
    const startn :number = Number(start);
    const endn :number = Number(end);
    for (let i=startn; i<=endn;i++){
        checkid(i.toString());
    }
    // console.log("finished dumb range from " + start + " to " + end);
}
function handle_range(start:string, end:string){
    const startn :number = Number(start);
    const endn :number = Number(end);
    if(end.length/2 > start.length) {handle_range_dumb(start,end)}
    const startfirsthalf :string = start.slice(0,Math.floor(end.length/2));
    if (startfirsthalf=== end.slice(0,Math.floor(end.length/2))){
        const idtocheck: number = Number(startfirsthalf+startfirsthalf) ;
        if(idtocheck >= startn && idtocheck <= endn)
        {
            // console.log("found invalid id: " + idtocheck);
            accumulator+=idtocheck;
        }
    } else{
        handle_range_dumb(start,end);
    }

}

function count_ids_to_check(input:string[][]){
    let counter = 0;
    input.forEach(pair => 
    {
        counter += Number(pair[1])- Number(pair[0]);
    }
    )
    console.log("we have to check " + counter + " ids");
}


// let input = readlines("user.txt").map((s)=> new Rotation(s));
let input = readfile("user.txt",2).split(',').map(p => p.split('-'));
count_ids_to_check(input);
// input.forEach(pair => handle_range(pair[0],pair[1]));
input.forEach(pair => handle_range_dumb_v2(pair[0],pair[1]));

console.log(accumulator2);



