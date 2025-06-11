import { Grid } from './Grid.ts'
import { Position, RelativePosition } from '../../shared/types.ts'
import { sleep } from '../../shared/utils.ts'

export class WfcEngine {
  constructor(private grid: Grid, private animationDelay = 0) {}

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
    const currentOptions = this.grid.get(position.x, position.y)
    const neighbors = this.getNeighbors(position)

    // Collect all possible options based on current neighbors
    const possibleOptions: typeof currentOptions = []

    // For each tile in the full tile set (assume grid.tileSet exists)
    for (const tile of this.grid.initialOptions) {
      const isValid = Object.entries(neighbors).every(([dir, pos]) => {
        if (!pos) return true // Handle edges where neighbor doesn't exist
        const neighborOptions = this.grid.get(pos.x, pos.y)
        const dirIdx = { top: 0, right: 1, bottom: 2, left: 3 }[
          dir as RelativePosition
        ]
        const oppIdx = (dirIdx + 2) % 4
        return neighborOptions.some(
          (n) => n.sockets[oppIdx] === tile.sockets[dirIdx]
        )
      })
      if (isValid) possibleOptions.push(tile)
    }

    // Only update if options actually changed
    if (
      possibleOptions.length !== currentOptions.length ||
      !possibleOptions.every((t) => currentOptions.includes(t))
    ) {
      this.grid.set(position.x, position.y, possibleOptions)
    }
  }

  async propagate(startPositions: Position[]): Promise<void> {
    const stack = [...startPositions]

    while (stack.length) {
      const pos = stack.pop()!
      const before = this.grid.get(pos.x, pos.y).length
      this.reduce(pos)
      const after = this.grid.get(pos.x, pos.y).length

      if (before !== after) {
        // Only propagate if options were reduced or increased
        const neighbors = Object.values(this.getNeighbors(pos)).filter(
          (n) => n && this.grid.get(n.x, n.y).length > 1 // Ensure neighbor is not already collapsed
        )
        stack.push(...(neighbors as Position[]))
      }

      if (this.animationDelay) await sleep(this.animationDelay)
    }
  }

  async collapse(positions: Position[]): Promise<void> {
    const stack = positions.toSorted((a, b) => {
      const aOptions = this.grid.get(a.x, a.y).length
      const bOptions = this.grid.get(b.x, b.y).length
      return bOptions - aOptions // Sort by number of options (descending)
    })

    while (stack.length) {
      const pos = stack.pop()!
      const options = this.grid.get(pos.x, pos.y)
      const choice = options[Math.floor(Math.random() * options.length)]
      this.grid.set(pos.x, pos.y, [choice])

      const neighbors = Object.values(this.getNeighbors(pos)).filter(
        (neighbor) =>
          neighbor && this.grid.get(neighbor.x, neighbor.y).length > 1
      )

      await this.propagate(neighbors) // stack of positions to propagate
    }
  }

  async unCollapse(positions: Position[]): Promise<void> {
    for (const pos of positions) {
      this.grid.reInitialize(pos.x, pos.y)
    }

    await this.propagate(positions) // Re-propagate from the collapsed position
  }
}
