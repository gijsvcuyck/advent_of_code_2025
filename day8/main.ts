import { readfile, readlines, splitlines } from "../utils/fileutils.ts";
import { Grid } from "../utils/grid.ts";

class Junctionbox{
    x:number;
    y:number;
    z:number;

    constructor(x:string,y:string,z:string){
        this.x = Number(x);
        this.y = Number(y);
        this.z = Number(z);
    }

    get_euclidian_distance(box:Junctionbox):number{
        return Math.sqrt((box.x-this.x)**2+(box.y-this.y)**2+(box.z-this.z)**2)
    }

    toString():string{
        return `${this.x},${this.y},${this.z}`
    }
}

class Network{
    id:number;
    members:number[];
    static nextid:number = 0;

    constructor(initial:number){
        this.id = Network.nextid;
        Network.nextid++;
        this.members = [initial];
    }

    merge(network:Network,networkmapping:Number[]){
        network.members.forEach(m=>networkmapping[m] = this.id)
        this.members = this.members.concat(network.members);
    }

    size():number{
        return this.members.length
    }
}

function make_connections(conectioncount:number, networkmapping:number[],networks:Map<number,Network>,startingconn:number){
    for(let i = startingconn; i < startingconn+conectioncount; i++){
        let [leftbox,rightbox,distance] = distancepairs[i];
        if(networkmapping[leftbox] === networkmapping[rightbox]){continue;}
        // console.log(`making connection from ${input[leftbox]} to ${input[rightbox]} with distance ${distance}`)
        let rightnetwork = networks.get(networkmapping[rightbox])!;
        networks.get(networkmapping[leftbox])?.merge(rightnetwork,networkmapping);
        networks.delete(rightnetwork.id)
    }
}

const INPUTFILE: "user" | "test" = "user"
const CONNECTIONCOUNT = INPUTFILE === "test" ? 10 : 1000;
let input: Junctionbox[] = readlines(INPUTFILE+".txt",8).map(l=>l.split(",")).map(([x,y,z])=> new Junctionbox(x,y,z));
let distancepairs: [number,number,number][] = Array(((input.length-1)*input.length)/2);
let fillcounter=0;
for(let i = 0; i < input.length; i++){
    for(let j = i+1; j < input.length; j++){
        distancepairs[fillcounter] = [i,j,input[i].get_euclidian_distance(input[j])];
        fillcounter++;
    }
}

console.log("now starting sorting")
distancepairs.sort((left,right)=> left[2]-right[2])
console.log("finished sorting")
// console.log(distancepairs)

/**maps junctionbox ids to the network id of which they are a part. */
let networkmapping : number[] = Array.from(Array(input.length).keys());
/** maps network ids to their network information. */
let networks: Map<number,Network> = new Map;
for(let m = 0; m<input.length; m++){
    networks.set(m,new Network(m));
}
make_connections(CONNECTIONCOUNT,networkmapping,networks,0);




console.log("now sorting networks")
let networklist : Network[] = Array.from(networks.values())
networklist.sort((left,right)=>  right.size()-left.size())
console.log("finished sorting")
console.log(`the three biggest networks have sizes ${networklist[0].size()}, ${networklist[1].size()}, and ${networklist[2].size()}`);
console.log(`This gives a combined size of ${networklist[0].size()*networklist[1].size()*networklist[2].size()}`)

console.log("now on to part 2");
let totalconnections = CONNECTIONCOUNT;
//Make connections until we need only one more, but dont actually make that one yet.
while(networks.size>2){
    let newconnections = networks.size-2
    make_connections(networks.size-2,networkmapping,networks,totalconnections);
    totalconnections+=newconnections
}

// Find the final connection, and print the required connection information.
while(totalconnections< distancepairs.length){
    let [leftbox,rightbox,distance] = distancepairs[totalconnections];
    totalconnections++
    if(networkmapping[leftbox] === networkmapping[rightbox]){
        continue;
    }
    else{
        console.log(`found the final connection between ${input[leftbox]} and ${input[rightbox]} for a value of ${input[leftbox].x * input[rightbox].x}`)
        break;
    }
}

//first answer: 153328
