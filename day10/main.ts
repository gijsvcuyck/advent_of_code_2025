import { fillArray } from "../utils/arrayutils.ts";
import { readfile, readlines, splitlines, writefile } from "../utils/fileutils.ts";
import { Grid } from "../utils/grid.ts";
import { Point } from "../utils/point.ts";
import {MinPriorityQueue} from '@datastructures-js/priority-queue';
import {init } from 'z3-solver'
import z3 from 'z3-solver'




const Light = {
    ON: '#',
    OFF: '.'
} as const;
type Light = (typeof Light)[keyof typeof Light];

function parseLight(f: string): Light {
    const values: string[] = Object.values(Light);
    if (values.includes(f)) {
        return f as Light
    } else {
        throw new Error(`${f} is not a valied Light`);
    }
}

class Button {
    affectedLights: number[];

    constructor(buttons:string){
        this.affectedLights = buttons.slice(1,-1).split(',').map(l=>Number(l))
    }
}

class Machine{
    correctIndicators: Light[];
    buttons: Button[];
    joltageRequirements: number[];

    constructor(initstring:string){
        let [lightstring,nolightstring] = initstring.split('] ')
        let [buttonstring,voltagestring] = nolightstring.split(' {')
        this.correctIndicators = lightstring.slice(1).split("").map(c=>parseLight(c));
        this.buttons = buttonstring.split(' ').map(s=>new Button(s))
        this.joltageRequirements = voltagestring.slice(0,-1).split(',').map(s=> Number(s));
    }

    checklights(currentIndicators:Light[]):boolean{
        if(currentIndicators.length!==this.correctIndicators.length)
            {return false}
        for(let l=0;l<currentIndicators.length;l++){
            if(currentIndicators[l]!==this.correctIndicators[l])
                {return false}
        }
        return true;
    }

    /**
     * Creats a copy of currentIndicators where some lights have been toggled from off to on according to the given buttonid
     */
    toggleButton(currentIndicators:Light[], buttonid:number):Light[]{
        let retval = currentIndicators.slice();
        this.buttons[buttonid].affectedLights.forEach(l=>{
            retval[l] = retval[l] === Light.ON ? Light.OFF : Light.ON
        })
        return retval;

    }

    toggleJoltageButton(currentJoltages: number[], buttonId: number):number[] {
        let retval = currentJoltages.slice();
        this.buttons[buttonId].affectedLights.forEach(l=>{
            retval[l]+=1
        })
        return retval;
    }

    getWorstCounter(currentJoltages:number[]):number|undefined{
        let worst = undefined
        let worstvalue = 0;
        this.joltageRequirements.forEach((joltage,i)=> {
            let difference = joltage - currentJoltages[i]
            if(difference > worstvalue){
                worstvalue = difference
                worst = i
            }
        })
        return worst
    }

    getDistance(currentJoltages:number[]):number{

        let distance = 0;
        this.joltageRequirements.forEach((joltage,i)=> {
            distance += (joltage - currentJoltages[i])
            
        })
        return distance
    }

    /**
     * Checks if the currentJoltages match the joltageRequirements
     * @param currentJoltages 
     * @returns 0 if joltages match, -1 if they are too low, 1 if they are too high
     */
    checkJoltage(currentJoltages:number[]):-1|0|1{
        // if(currentJoltages.length!==this.joltageRequirements.length)
        //     {return false}
        let retval: -1|0 = 0;
        for(let l=0;l<currentJoltages.length;l++){
            if(currentJoltages[l]>this.joltageRequirements[l])
                {return 1}
            else if(currentJoltages[l]<this.joltageRequirements[l]){
                retval = -1
            }
        }
        return retval;
    }
}






type Joltages = number[]
type MapKey = string
function joltageAsKey(input:Joltages):MapKey{
    return input.toString();
}

//This is an adaption of the Astar pseudocode from wikipedia
function starry_search(start:Joltages, machine:Machine):number{
    // The set of discovered nodes that may need to be (re-)expanded.
    // Initially, only the start node is known.
    // This is usually implemented as a min-heap or priority queue rather than a hash-set.
    let openSet: MinPriorityQueue<Joltages> = new MinPriorityQueue((joltage)=>fScore.get(joltageAsKey(joltage))!);
    openSet.push(start)



    // For node n, gScore[n] is the currently known cost of the cheapest path from start to n.
    let gScore : Map<MapKey,number> = new Map();
    gScore.set(joltageAsKey(start),0)

    // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // how cheap a path could be from start to finish if it goes through n.
    let fScore:  Map<MapKey,number> = new Map();
    fScore.set(joltageAsKey(start), machine.getDistance(start));

    while(!openSet.isEmpty()){
        // This operation can occur in O(Log(N)) time if openSet is a min-heap or a priority queue
        let current :Joltages = openSet.pop()!;
        let currentdistance = machine.checkJoltage(current);
        if (currentdistance === 0)
            return gScore.get(joltageAsKey(current))!;
        else if(currentdistance === 1){
            continue
        }

        machine.buttons.forEach((b,bid)=>{
            let neighbor = machine.toggleJoltageButton(current,bid);
        
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            let tentative_gScore:number = gScore.get(joltageAsKey(current))! + 1
            let knownbest_gScore:number = gScore.has(joltageAsKey(neighbor)) ? gScore.get(joltageAsKey(neighbor))! : Number.MAX_SAFE_INTEGER
            if (tentative_gScore < knownbest_gScore)
                // This path to neighbor is better than any previous one. Record it!
                gScore.set(joltageAsKey(neighbor),tentative_gScore)
                fScore.set(joltageAsKey(neighbor), tentative_gScore + machine.getDistance(neighbor))
                if(!openSet.contains((member)=> joltageAsKey(member)==joltageAsKey(neighbor))){
                    openSet.push(neighbor)
                }
        });
    }
    // Open set is empty but goal was never reached
    throw new Error("A* failed")
}
let input: Machine[]= readlines('isolation.txt',10).map(l=>new Machine(l));

const QUESTION :number = 2

//Question 1
if(QUESTION === 1)
{
    let stepAccumulator = 0;
    input.forEach(machine=>{
        let depth = 0;
        let worklist: [Light[],number][] = [[fillArray(machine.correctIndicators.length,Light.OFF),-1]]
        looplabel: while(worklist.length>0)
        {
            let levelsize = worklist.length;
            for(let i = 0; i<levelsize;i++){
                let [currentIndicators,highestbutton] = worklist.shift()!;
                if(machine.checklights(currentIndicators)){
                    stepAccumulator+= depth;
                    break looplabel;
                }
                for(let b = highestbutton+1; b<machine.buttons.length;b++)
                {
                    worklist.push([machine.toggleButton(currentIndicators,b),b])
                }
            }
            depth++
        }
    })
    console.log(`the minimum amount of button preses is ${stepAccumulator}`);
} else
{//Question 2, part 3, now with z3.
    //This is based on the example found at https://github.com/hiimjasmine00/advent-of-code/blob/master/2025/day10/part2.js, as the original z3 javascript api documentation is not currently availiable.
    let stepAccumulator = await run_z3_solution(0);
    
       
    console.log(`the minimum amount of button preses to fix the joltage is ${stepAccumulator}`);
    //21022 is too high
    //problem on machine on line 191
}

async function run_z3_solution(stepAccumulator:number): Promise<number>{

    return init().then(async ({ Context }) => {
        let debuglog = "";
        for(let mId= 0; mId < input.length; mId++){
            let machine = input[mId];
            const { Int, Optimize} = Context("main");
            const solver = new Optimize();
            let variables: Arith<"main">[] = [];
            for(let bId=0; bId<machine.buttons.length;bId++)
            {
                const value = Int.const(`m_${mId}_b_${bId}`);
                solver.add(value.ge(0));
                variables.push(value);
            }
            for(let jId=0; jId<machine.joltageRequirements.length;jId++)
            {
                let buttonsummation: Arith<"main"> = Int.val(0);
                for(let bId=0; bId<machine.buttons.length;bId++){
                    if (machine.buttons[bId].affectedLights.includes(jId)) {
                        buttonsummation = buttonsummation.add(variables[bId])
                    }
                }
                let joltageCondition: Bool<"main">= buttonsummation.eq(Int.val(machine.joltageRequirements[jId]));
                // console.log(`now adding ${joltageCondition}`)
                solver.add(joltageCondition);
            }
            
        
            const totalButtonSummation = variables.reduce((a, x) => a.add(x), Int.val(0));
            // console.log(`now adding ${totalButtonSummation}`)
            solver.minimize(totalButtonSummation);
            let result:string =  await solver.check()
            // console.log(`the result is ${result}`)
            if (result === "sat") {
                let resultvalue = parseInt(solver.model().eval(totalButtonSummation).toString());
                debuglog+=`solved machine ${mId} in ${resultvalue} button presses\n`
                stepAccumulator += resultvalue;
            } else{
                console.log(`failed to solve for machine ${mId} result was ${result}`)
            }
        }
        writefile("testdebuglog.txt",debuglog,10)
        return stepAccumulator;
    })
}



// {//Question 2, but new and improved
//     let stepAccumulator = 0;
//     input.forEach((machine,index)=>{
//         let bestdistance = starry_search(fillArray(machine.joltageRequirements.length,0),machine);
//         console.log(`found value ${bestdistance} for machine ${index}`)
//         stepAccumulator+=bestdistance;
//     })
//     console.log(`the minimum amount of button preses to fix the joltage is ${stepAccumulator}`);
// }

// {//Question 2, but old and wrong
//     let stepAccumulator = 0;
//     input.forEach((machine,index)=>{
//         let depth = 0;
//         let worklist: [number[],number][] = [[fillArray(machine.joltageRequirements.length,0),0]]
//         //TODO: do initial joltage check here
//         looplabel: while(worklist.length>0)
//         {
//             let levelsize = worklist.length;
//             for(let i = 0; i<levelsize;i++){
//                 let [currentJoltages,highestbutton] = worklist.shift()!;
//                 // if (worstcounter === undefined){
//                 //     stepAccumulator+=depth;
//                 //     console.log(`found value ${depth} for machine ${index}`)
//                 //     break looplabel;
//                 // }
//                 for(let b = highestbutton; b<machine.buttons.length;b++)
//                 {
//                     let newjoltages = machine.toggleJoltageButton(currentJoltages,b)
//                     let joltagecheck = machine.checkJoltage(newjoltages)
//                     if(joltagecheck=== 0){
//                         stepAccumulator+= depth+1;
//                         console.log(`found value ${depth+1} for machine ${index}`)
//                         break looplabel;
//                     } else if(joltagecheck === -1){
//                         worklist.push([newjoltages,b])
//                     }
//                 }
//             }
//             depth++
//         }
//     })
//     console.log(`the minimum amount of button preses to fix the joltage is ${stepAccumulator}`);

//}
