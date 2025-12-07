/**
 * A two dimensional grid of elements.
 * Access works with the get and set methods, which both protect against out of bound acess.
 * Any out of bound acess will instead result in the 'default element', supplied using the constructor.
 * 
 */
export class Grid<FieldT> {
    // the field, stored as an array of rows, so grid[y][x] gets a logical point.
    grid: FieldT[][];
    default_elem: FieldT;

    constructor(default_elem: FieldT, grid?: FieldT[][]) {
        this.grid = grid ?? [];
        this.default_elem = default_elem;
    }


    get(x: number, y: number): FieldT {
        if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[y].length) {
            return this.default_elem
        } else {
            return this.grid[y][x]
        }
    }

    set(x: number, y: number, val: FieldT) {
        if (y < 0 || y >= this.grid.length || x < 0 || x >= this.grid[y].length) {
            return;
        } else {
            this.grid[y][x] = val;
        }
    }

    printfield() {
        this.grid.forEach(row => console.log(row));
    }

    /**
     * 
     * @returns the length of the first row of this grid
     */
    getwidth(): number {
        return this.grid[0].length ?? 0
    }

    /**
     * 
     * @returns the number of rows in this grid
     */
    getheight(): number {
        return this.grid.length

    }

    /**
     * Performs an in-place mapping by applying f to each element of the grid, and then replacing the element with the result.
     * @param f a mapping function
     */
    transform(f : (x:FieldT) => FieldT){
        for (let y = 0; y< this.getheight(); y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                this.grid[y][x] = f(this.grid[y][x])
            }
        }
    }

}