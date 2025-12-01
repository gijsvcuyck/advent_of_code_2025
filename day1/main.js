const fs = require('node:fs');


// the hello world program
console.log('Hello World');
let dial = 50;
let correctcounter=0;
let previousdial=50;
let overturncounter=0;


function readfile(filename){
    try {
        return fs.readFileSync('./'+filename, 'utf8');
    } catch (err) {
        console.error(err);
    }
}

function readlines(filename){
    return readfile(filename).split(/\r?\n/);
}

function Rotation(string){
    this.direction = string[0];
    this.amount = Number(string.substring(1));
}

function turn_and_check(rotation){
    if (rotation.direction === 'R'){
        dial += rotation.amount
    } else {
        dial -= rotation.amount
    }
    if (dial%100 === 0) {
        correctcounter+=1;
    }
}

function check_overturn(){
    let overturn;
    if(dial%100===0|| previousdial%100===0) {
        overturn = Math.floor(Math.abs(previousdial-dial)/100);
    } else {
        let old_overturn = Math.floor(previousdial/100);
        let newoverturn = Math.floor(dial/100);
        overturn = Math.abs(old_overturn-newoverturn);
    }
    overturncounter += overturn;
    previousdial = dial;
}

// let input = readlines("user.txt").map((s)=> new Rotation(s));
let input = readlines("user.txt").map((s)=> new Rotation(s));


input.forEach((R)=> {turn_and_check(R); check_overturn();});
console.log("final correct counter:" + correctcounter);
console.log("overturn adjusted:" + (correctcounter+overturncounter));



