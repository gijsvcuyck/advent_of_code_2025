import { readfile, readlines, splitlines } from "../fileutils.ts";

function to_operator(opstring: string): ((x:bigint, y:bigint) => bigint) {
    if(opstring === "*"){
        return ((x:bigint,y:bigint) => x*y)
    } else if (opstring === "+"){
        return ((x:bigint,y:bigint) => x+y);
    } else {
        throw new Error("cannot convert " + opstring + " to a math operator");
    }
}

function get_identity_value(opstring: string):bigint{
    if(opstring === "*"){
        return 1n
    } else if (opstring === "+"){
        return 0n
    } else {
        throw new Error("cannot convert " + opstring + " to a math operator");
    }
}

let grandtotal : bigint = 0n;
let input = readlines("user.txt",6).map(l=> l.trim());
let math : bigint[][]= input.slice(0,-1).map(l=> l.split(/ +/).map(n => BigInt(n)));
let operators :string[] = input.at(-1)?.split(/ +/)!;
// console.log(`parsed mathops: ${operators}`)

let mathops = operators.map(op => to_operator(op));


for(let i = 0; i< operators.length; i++){
    let accumulator = get_identity_value(operators[i]);
    math.forEach(numberline => {
        accumulator = to_operator(operators[i])(accumulator,numberline[i]);
    });
    grandtotal+=accumulator;
}

console.log(`the grand total is ${grandtotal}`);


// Part 2
function build_number(base:bigint | undefined,addition:string): bigint | undefined {
    if(addition === ' ' || addition === undefined)
    {
        return base;
    }
    if (base === undefined)
    {
        return BigInt(addition);
    } else {
        return  base*10n+ BigInt(addition);
    }
}


let grandtotalv2 : bigint = 0n;
let inputv2 = readlines("user.txt",6);
let mathv2 : string[][]= inputv2.slice(0,-1).map(l=> l.split(""));
let operatorsv2 :string[] = inputv2.at(-1)?.split("")!;

// console.log(build_number(build_number(build_number(undefined,'9'),' '),'0'));
let opindex= operatorsv2.findIndex((char)=> char !== ' ');
while(opindex < operatorsv2.length){
    let mathtotal = get_identity_value(operatorsv2[opindex]);
    let operator = to_operator(operatorsv2[opindex]);
    let number :bigint | undefined = mathtotal;
    while (number !== undefined) {
        mathtotal = operator(mathtotal,number)
        number = undefined;
        mathv2.forEach(matharray=>{
            number = build_number(number,matharray[opindex])
        });
        opindex++
    }
    grandtotalv2+=mathtotal;
    // opindex = operatorsv2.findIndex((char,index)=> index > opindex && char !== '')
}
console.log(`but the real acual grand total is ${grandtotalv2}`);