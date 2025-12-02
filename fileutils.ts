import fs from 'node:fs';

export function readfile(filename : string, day:number) : string{
    let retval;
    try {
        retval = fs.readFileSync('./day'+ day + '/' +filename, 'utf8');
    } catch (err) {
        console.error(err);
    }
    if (!retval){console.error("error while reading file")}
    return retval!;
}

export function readlines(filename: string, day:number){
    return readfile(filename,day).split(/\r?\n/);
}