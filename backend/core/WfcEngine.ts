import { Grid } from './Grid.ts'
import { Position, RelativePosition, Tile } from '../../shared/types.ts'
import { sleep } from '../../shared/utils.ts'

export class WfcEngine {
  constructor(
    private grid: Grid,
    private tiles: Tile[],
    private animationDelay = 0
  ) {}

  getNeighbors({
    x,
    y,
  }: Position): Partial<Record<RelativePosition, Position>> {
    const n: Partial<Record<RelativePosition, Position>> = {}
    if (x > 0) n.left = { x: x - 1, y }
    if (x < this.grid.width - 1) n.right = { x: x + 1, y }
    if (y > 0) n.top = { x, y: y - 1 }
    if (y < this.grid.height - 1) n.bottom = { x, y: y + 1 }
    return n
  }

  reduce(position: Position): void {
    const options = this.grid.get(position.x, position.y)
    const neighbors = this.getNeighbors(position)

    const filtered = options.filter((tile) => {
      return Object.entries(neighbors).every(([dir, pos]) => {
        if (!pos) return true
        const neighborOptions = this.grid.get(pos.x, pos.y)
        const dirIdx = { top: 0, right: 1, bottom: 2, left: 3 }[
          dir as RelativePosition
        ]
        const oppIdx = (dirIdx + 2) % 4
        return neighborOptions.some(
          (n) => n.sockets[oppIdx] === tile.sockets[dirIdx]
        )
      })
    })

    this.grid.set(position.x, position.y, filtered)
  }

  async propagate(startPositions: Position[]): Promise<void> {
    const stack = [...startPositions]

    while (stack.length) {
      const pos = stack.pop()!
      const before = this.grid.get(pos.x, pos.y).length
      this.reduce(pos)
      const after = this.grid.get(pos.x, pos.y).length

      if (before > after) {
        // Only propagate if options were reduced
        const neighbors = Object.values(this.getNeighbors(pos)).filter(
          (n) => n && this.grid.get(n.x, n.y).length > 1 // Ensure neighbor is not already collapsed
        )
        stack.push(...(neighbors as Position[]))
      }

      if (this.animationDelay) await sleep(this.animationDelay)
    }
  }

  async collapse(pos: Position): Promise<void> {
    const options = this.grid.get(pos.x, pos.y)
    const choice = options[Math.floor(Math.random() * options.length)]
    this.grid.set(pos.x, pos.y, [choice])

    const neighbors = Object.values(this.getNeighbors(pos)).filter(
      (neighbor) => neighbor && this.grid.get(neighbor.x, neighbor.y).length > 1
    )

    await this.propagate(neighbors) // stack of positions to propagate
  }
}
