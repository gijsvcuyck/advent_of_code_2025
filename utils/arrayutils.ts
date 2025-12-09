export function fillArray<T>(size:number,elem:T):Array<T>{
    return Array.from({ length: size }, (_) => elem);
}

export function fillArrayCallback<T>(size:number,callback:()=>T):Array<T>{
    return Array.from({ length: size }, (_) => callback());
}

export function range(size:number):Array<number>{
    return Array.from({ length: size }, (_,i) => i);
}