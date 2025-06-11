import { TileSet } from '../core/TileSet.ts'
import { Grid } from '../core/Grid.ts'
import { WfcEngine } from '../core/WfcEngine.ts'
import { Position, SerializedTile } from '../../shared/types.ts'
import { VIEW_RADIUS } from '../../shared/constants.ts'
import { PlayerManager } from './PlayerManager.ts'
import { BeaconManager } from './BeaconManager.ts'

export class GameWorld {
  private tileSet: TileSet
  private grid: Grid
  private engine: WfcEngine

  public playerManager: PlayerManager
  public beaconManager: BeaconManager

  constructor(rawTiles: TileSet, width: number, height: number) {
    this.tileSet = rawTiles
    this.grid = new Grid(width, height, this.tileSet.tiles)
    this.engine = new WfcEngine(this.grid)

    this.playerManager = new PlayerManager(this)
    this.beaconManager = new BeaconManager(this)
  }

  public getGrid() {
    return this.grid
  }

  // Loads the tiles in the specified chunk around the given position.
  // This method will collapse the tiles (if not already collapsed) in the chunk to ensure they fit together.
  public async loadChunk(pos: Position): Promise<SerializedTile[]> {
    const radius = VIEW_RADIUS

    const cellsToCollapse = this.grid
      .getInRadius(pos.x, pos.y, radius)
      .filter((cell) => cell.options.length > 1)
      .map((cell) => ({ x: cell.x, y: cell.y }))

    // Collapse the tiles in the chunk
    await this.engine.collapse(cellsToCollapse)

    console.info(
      `Loaded chunk at (${pos.x}, ${pos.y}). Collapsed ${cellsToCollapse.length} tiles:`
    )
    console.info(
      cellsToCollapse.map((pos) => `(${pos.x}, ${pos.y})`).join(', ')
    )

    return this.getSerializedChunk(pos)
  }

  // Unloads only the tiles in the specified chunk that are not currently loaded by a player or beacon
  public async unloadChunk(pos: Position) {
    const radius = VIEW_RADIUS + 1

    const cellsToUnCollapse = this.grid
      .getInRadius(pos.x, pos.y, radius)
      .filter((cell) => {
        // Check if the tile is loaded by any player or beacon
        return (
          !this.playerManager.isLoadingTile(cell.x, cell.y) &&
          !this.beaconManager.isLoadingTile(cell.x, cell.y)
        )
      })
      .map((cell) => ({ x: cell.x, y: cell.y }))

    // Uncollapse the tiles in the chunk
    await this.engine.unCollapse(cellsToUnCollapse)

    console.info(
      `Unloaded ${cellsToUnCollapse.length} tiles at chunk (${pos.x}, ${pos.y}):`
    )
    console.info(
      cellsToUnCollapse.map((pos) => `(${pos.x}, ${pos.y})`).join(', ')
    )
  }

  public getSerializedChunk(center: Position) {
    const radius = VIEW_RADIUS
    const result: SerializedTile[] = []

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = center.x + dx
        const y = center.y + dy

        const cell = this.grid.get(x, y)

        if (cell.length === 1) {
          result.push({
            x,
            y,
            tile: cell[0],
          })
        }
        if (cell.length <= 0) {
          console.warn(`Tile at (${x}, ${y}) is empty, this should not happen!`)
        }
      }
    }
    return result
  }
}
