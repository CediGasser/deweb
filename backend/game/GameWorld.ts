import { TileSet } from '../core/TileSet.ts'
import { Grid } from '../core/Grid.ts'
import { WfcEngine } from '../core/WfcEngine.ts'
import { Position, SerializedTile } from '../shared/types.ts'
import { VIEW_RADIUS } from '../shared/constants.ts'

export class GameWorld {
  private tileSet: TileSet
  private grid: Grid
  private engine: WfcEngine

  constructor(rawTiles: TileSet, width: number, height: number) {
    this.tileSet = rawTiles
    this.grid = new Grid(width, height, this.tileSet.tiles)
    this.engine = new WfcEngine(this.grid)
  }

  public generateWorld() {
    console.info(
      `Generating world with dimensions ${this.grid.width}x${this.grid.height}...`
    )
    let retries = 0
    while (retries < 20) {
      try {
        this.engine.collapse()
        break // If collapse succeeds, exit the loop
      } catch {
        console.warn(`World generation ${retries} failed, retrying...`)
        this.grid = new Grid(
          this.grid.width,
          this.grid.height,
          this.tileSet.tiles
        )
        this.engine = new WfcEngine(this.grid)
        // Reset the grid and engine for a fresh start
        retries++
        continue // Retry if collapse fails
      }
    }
    console.info('World generation complete.')
  }

  public getGrid() {
    return this.grid
  }

  public getChunk(center: Position): SerializedTile[] {
    const radius = VIEW_RADIUS

    const tiles = this.grid
      .getInRadius(center.x, center.y, radius)
      .map((cell) => {
        return {
          x: cell.x,
          y: cell.y,
          tile: cell.options[0],
        }
      })

    console.info(
      `Loaded chunk at (${center.x}, ${center.y}). ${tiles.length} tiles:`
    )

    return tiles
  }
}
