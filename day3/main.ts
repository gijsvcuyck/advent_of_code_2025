import {readfile, readlines } from "../utils/fileutils.ts";

let accumulator :number =0;
let accumulator_v2 :number =0;

// Only works for T for which < and > are defined. Does not yet allow for supplying a generic comparison function.
// current default is smallest first.
function indexsort<T>(array :T[]){
    let indices = new Array(array.length);
    for (var i = 0; i < array.length; i++) {indices[i] = i;}
    indices.sort((a, b) => { return array[a] > array[b] ? -1 : array[a] < array[b] ? 1 : 0; });
    return indices;
}
//Again, T needs to be comparable
function getfirstindexbetween<T>(array: T[], minimum: T, maximum: T) : number{
    for (let i = 0; i<array.length; i++){
        if(array[i]< maximum && array[i] > minimum){
            // console.log(`in an attempt to find an index between ${minimum} and ${maximum}`)
            return i;
        }
    }
    throw new RangeError(`no valid value in ${array} below ${maximum} while above ${minimum}`);

}

function processbatterybank_v1(batterybank : string[]){
    let sorted = indexsort(batterybank)
    let firstbatindex = getfirstindexbetween(sorted,-1,sorted.length-1);
    let firstbat = batterybank[sorted[firstbatindex]];
    let secondbatindex = getfirstindexbetween(sorted,sorted[firstbatindex],sorted.length)
    let joltage :string = firstbat+ batterybank[sorted[secondbatindex]]
    accumulator += Number(joltage);
    // console.log(`now handling batterybank: ${batterybank}`)
    // console.log(`the indexsorted array for this bank is: ${sorted}`)
    // console.log(`best joltage: ${joltage}`)
}

function processbatterybank_v2(batterybank : string[]){
    let sorted = indexsort(batterybank)
    let minimum_index = -1;
    let joltage :string = ""
    for (let battery =0; battery <12; battery++){
        let index = getfirstindexbetween(sorted,minimum_index,sorted.length-(11-battery))
        minimum_index = sorted[index];
        joltage += batterybank[minimum_index]
    }
    accumulator_v2 += Number(joltage);
    // console.log(`now handling batterybank: ${batterybank}`)
    // console.log(`the indexsorted array for this bank is: ${sorted}`)
    // console.log(`best joltage: ${joltage}`)
}

let input = readlines("user.txt",3).map(l => l.split(""));
input.forEach(batterybank=> {
   processbatterybank_v1(batterybank);
   processbatterybank_v2(batterybank);

})

console.log(`max voltage: ${accumulator}, or with overdrive: ${accumulator_v2}`);



