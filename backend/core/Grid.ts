import type { Position, Tile } from '../../shared/types.ts'

export type Cell = Tile[]

export class Grid {
  readonly width: number
  readonly height: number
  readonly initialOptions: Tile[]
  private readonly cells: Map<string, Cell> = new Map()

  constructor(width: number, height: number, initialOptions: Tile[]) {
    this.width = width
    this.height = height
    this.initialOptions = initialOptions
  }

  get(x: number, y: number): Cell {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return []
    }

    const key = `${x},${y}`

    if (!this.cells.has(key)) {
      return structuredClone(this.initialOptions)
    }

    return this.cells.get(key) || []
  }

  getInRadius(x: number, y: number, radius: number) {
    const cells: (Position & { options: Cell })[] = []
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          cells.push({
            x: nx,
            y: ny,
            options: this.get(nx, ny),
          })
        }
      }
    }
    return cells
  }

  set(x: number, y: number, options: Cell): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return
    }

    const key = `${x},${y}`
    if (
      options.length === this.initialOptions.length &&
      options.every((tile, index) => tile === this.initialOptions[index])
    ) {
      // If options match the initial state, remove the cell
      this.cells.delete(key)
    } else {
      this.cells.set(key, options)
    }
  }

  reInitialize(x: number, y: number): void {
    const key = `${x},${y}`
    this.cells.delete(key)
  }

  isCollapsed(x: number, y: number): boolean {
    return this.get(x, y).length === 1
  }
}
