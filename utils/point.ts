export class Point{
    x:number;
    y:number;
    
    constructor(x:number,y:number);
    constructor(x:string,y:string);
    constructor(x:string|number,y:string|number){
        this.x = Number(x);
        this.y = Number(y);
    }

    toString():String{
        return this.x + ',' + this.y
    }
}