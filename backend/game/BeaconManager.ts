import { VIEW_RADIUS, BEACON_COUNT } from '../../shared/constants.ts'
import type { Position } from '../../shared/types.ts'
import type { GameWorld } from './GameWorld.ts'

interface Beacon {
  id: string
  position: Position
}

export class BeaconManager {
  private beacons: Map<string, Beacon> = new Map()
  private gameWorld: GameWorld

  constructor(gameWorld: GameWorld) {
    // Initialize player manager with the game world if needed
    // This could be used to set up initial players or other configurations
    this.gameWorld = gameWorld

    // Initialize beacons with random positions
    for (let i = 0; i < BEACON_COUNT; i++) {
      const id = `beacon-${i}`
      const position: Position = {
        x: Math.floor(Math.random() * gameWorld.getGrid().width),
        y: Math.floor(Math.random() * gameWorld.getGrid().height),
      }
      this.beacons.set(id, { id, position })
    }
  }

  // Check if the tile is in the view radius of any player
  public isLoadingTile(x: number, y: number): boolean {
    const radius = VIEW_RADIUS

    return this.getAllBeacons().some((beacon) => {
      const pos = beacon.position
      return Math.abs(pos.x - x) <= radius && Math.abs(pos.y - y) <= radius
    })
  }

  public getAllBeacons(): Beacon[] {
    return Array.from(this.beacons.values())
  }
}
