import { Grid } from './Grid.ts'
import { Position, RelativePosition, Socket } from '../../shared/types.ts'
import { EntropyQueue } from './EntropyQueue.ts'

export class WfcEngine {
  private entropyQueue = new EntropyQueue()

  constructor(private grid: Grid) {}

  private invertSocket(socket: Socket): Socket {
    return socket.split('-').reverse().join('-')
  }

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

    // For each tile in the full tile set (assume grid.tileSet exists)
    const filtered = options.filter((tile) => {
      return Object.entries(neighbors).every(([dir, pos]) => {
        if (!pos) return true // Handle edges where neighbor doesn't exist
        const neighborOptions = this.grid.get(pos.x, pos.y)
        const dirIdx = { top: 0, right: 1, bottom: 2, left: 3 }[
          dir as RelativePosition
        ]
        const oppIdx = (dirIdx + 2) % 4
        return neighborOptions.some(
          (n) => tile.sockets[dirIdx] === this.invertSocket(n.sockets[oppIdx])
        )
      })
    })

    this.grid.set(position.x, position.y, filtered)
  }

  propagate(startPositions: Position[]): void {
    const stack = [...startPositions]

    while (stack.length) {
      const pos = stack.pop()!
      const entropyBefore = this.grid.get(pos.x, pos.y).length
      this.reduce(pos)
      const entropyAfter = this.grid.get(pos.x, pos.y).length

      if (entropyAfter === 0) {
        const msg = `No valid options left for position (${pos.x}, ${pos.y}).`
        console.error(msg)
        throw new Error(msg)
      }

      if (entropyAfter < entropyBefore) {
        // Update lowest entropy positions
        if (entropyAfter > 1) {
          this.entropyQueue.update(pos, entropyAfter)
        }

        // Only propagate if options were reduced or increased
        const neighbors = Object.values(this.getNeighbors(pos)).filter(
          (n) => n && this.grid.get(n.x, n.y).length > 1 // Ensure neighbor is not already collapsed
        )
        stack.push(...(neighbors as Position[]))
      }
    }
  }

  collapse(): void {
    for (
      let pos: Position | null = {
        x: Math.floor(this.grid.width / 2),
        y: Math.floor(this.grid.height / 2),
      };
      pos !== null;
      pos = this.entropyQueue.extractRandomLowestEntropy()
    ) {
      const options = this.grid.get(pos.x, pos.y)
      const choice = options[Math.floor(Math.random() * options.length)]
      this.grid.set(pos.x, pos.y, [choice])

      console.info(`Collapsed position (${pos.x}, ${pos.y})`)

      const neighbors = Object.values(this.getNeighbors(pos)).filter(
        (neighbor) =>
          neighbor && this.grid.get(neighbor.x, neighbor.y).length > 1
      )

      this.propagate(neighbors) // stack of positions to propagate
    }
  }
}
