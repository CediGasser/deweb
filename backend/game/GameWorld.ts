import { TileSet } from '../core/TileSet.ts'
import { Cell, Grid } from '../core/Grid.ts'
import { WfcEngine } from '../core/WfcEngine.ts'
import { Position, Tile } from '../../shared/types.ts'
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
    this.engine = new WfcEngine(this.grid, this.tileSet.tiles)

    this.playerManager = new PlayerManager(this)
    this.beaconManager = new BeaconManager(this)
  }

  public getGrid() {
    return this.grid
  }

  // Loads the tiles in the specified chunk around the given position.
  // This method will collapse the tiles (if not already collapsed) in the chunk to ensure they fit together.
  public async loadChunk(pos: Position): Promise<Tile[]> {
    const radius = VIEW_RADIUS
    const tiles: Tile[] = []
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = pos.x + dx
        const y = pos.y + dy
        if (this.grid.get(x, y).length > 1) await this.engine.collapse({ x, y })

        tiles.push(this.grid.get(x, y)[0])
      }
    }

    return tiles
  }

  // Unloads only the tiles in the specified chunk that are not currently loaded by a player or beacon
  public unloadChunk(pos: Position) {
    const radius = VIEW_RADIUS + 1 // Unload one extra tile to ensure no adjacent tiles are left in the grid
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = pos.x + dx
        const y = pos.y + dy

        // Check if the tile is loaded by any player or beacon
        if (this.playerManager.isLoadingTile(x, y)) continue
        if (this.beaconManager.isLoadingTile(x, y)) continue

        this.grid.reInitialize(x, y)
      }
    }
  }

  public getSerializedChunk(center: Position, radius: number) {
    const result: { x: number; y: number; tile: Cell }[] = []
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = center.x + dx
        const y = center.y + dy
        result.push({
          x,
          y,
          tile: this.grid.get(x, y),
        })
      }
    }
    return result
  }
}
