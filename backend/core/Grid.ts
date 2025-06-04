import { Tile } from '../../shared/types.ts'

export type Cell = Tile[]

export class Grid {
  private cells: Cell[][]
  readonly width: number
  readonly height: number
  readonly initialOptions: Tile[]

  constructor(width: number, height: number, initialOptions: Tile[]) {
    this.width = width
    this.height = height
    this.initialOptions = initialOptions

    // Initialize a 2D array with the initial options for each cell
    this.cells = Array.from({ length: width }, () =>
      Array.from({ length: height }, () => [...initialOptions])
    )
  }

  get(x: number, y: number): Cell {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return []
    }
    return this.cells[x][y]
  }

  set(x: number, y: number, options: Cell): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return
    }
    this.cells[x][y] = options
  }

  reInitialize(x: number, y: number): void {
    this.cells[x][y] = [...this.initialOptions]
  }

  serialize(): Cell[][] {
    return this.cells
  }

  isCollapsed(x: number, y: number): boolean {
    return this.cells[x][y].length === 1
  }
}
