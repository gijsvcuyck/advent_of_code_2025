import { readfile, readlines, splitlines, writefile } from "../utils/fileutils.ts";


class Node{
    connections: Node[] = [];
    label:string;
    pathCounter:PathCounter = new PathCounter();

    constructor(allNodes:Map<string,Node>,label:string){
        this.label = label;
        allNodes.set(label,this);
    }

    addConnection(allNodes:Map<string,Node>,label:string){
        let connection = allNodes.get(label)
        if(connection === undefined){
            throw new Error("error when adding connection")
        }
        this.connections.push(connection)
    }
}

class PathCounter{
    counter = 0;
    FFTcounter=0;
    DACcounter=0;
    FFTDACcounter=0;

    add(counter:PathCounter){
        this.counter+=counter.counter
        this.FFTcounter+=counter.FFTDACcounter
        this.DACcounter+=counter.DACcounter
        this.FFTDACcounter+=counter.FFTDACcounter
    }

    addNumber(value:number){
        this.counter+=value
        this.FFTcounter+=value
        this.DACcounter+=value
        this.FFTDACcounter+=value
    }

    constructor(initial?:number){
        if(initial===undefined){
            return;
        }
        this.counter=initial
        this.FFTcounter=initial
        this.DACcounter=initial
        this.FFTDACcounter=initial
    }
}

class Graph{
    nodes:Map<string,Node>
    start:Node

    constructor(allNodes:Map<string,Node>){
        this.nodes = allNodes
        this.start = allNodes.get("you")!
    }

    countpaths(start:Node,end:Node):PathCounter{
        let counter = new PathCounter();
        if(start.label === end.label){
            counter.counter++
            return counter;
        } 
        if(start.pathCounter.counter>0){
            return start.pathCounter
        }

        start.connections.forEach(neighbour =>{
            counter.add(this.countpaths(neighbour,end))
        });
        if(start.label ==="dac"){
            counter.DACcounter = counter.counter
            counter.FFTDACcounter = counter.FFTcounter
        }
        else if(start.label ==="fft"){
            counter.FFTcounter= counter.counter
            counter.FFTDACcounter=counter.DACcounter
        }
        start.pathCounter = counter;
        return counter;
    }
}
let INPUTFILE = "user.txt"
let QUESTION:number = 2
let allNodes:Map<string,Node> = new Map();
allNodes.set("out",new Node(allNodes,"out"));
let input: [Node,string][] = readlines(INPUTFILE,11).map(l=>l.split(": ")).map(([label,connections])=> [new Node(allNodes,label),connections])
let _nodelist:Node[] = input.map(([n,connections])=> {connections.split(" ").forEach(c => n.addConnection(allNodes,c));return n})
let graph = new Graph(allNodes)
if(QUESTION === 1){
    let paths:PathCounter = graph.countpaths(graph.start,allNodes.get("out")!)
    console.log(`found ${paths.counter} routes from "you" to "out"`);
} else{
    let paths:PathCounter = graph.countpaths(allNodes.get("svr")!,allNodes.get("out")!)
    console.log(`found ${paths.counter} routes from "svr" to "out", but only ${paths.FFTDACcounter} paths that also pass trough both "FFT" and "DAC" at some point6`);
}
