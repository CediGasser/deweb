import { IDLE_TIMEOUT } from '../shared/constants.ts'
import type { Position } from '../shared/types.ts'
import type { GameWorld } from './GameWorld.ts'

interface Player {
  id: string
  name: string
  position: Position
  lastUpdate: Date
}

export class PlayerManager {
  private players: Map<string, Player> = new Map()
  private gameWorld: GameWorld

  constructor(gameWorld: GameWorld) {
    // Initialize player manager with the game world if needed
    // This could be used to set up initial players or other configurations
    this.gameWorld = gameWorld
  }

  public addPlayer(id: string, name: string): Position {
    // Create random starting position for the player
    const position: Position = { x: 0, y: 0 } // Default starting position

    // Brute force a random position within the game world until we find a valid one
    for (let attempts = 0; attempts < 100; attempts++) {
      // Ensure the position is within the bounds of the game world grid
      const grid = this.gameWorld.getGrid()
      position.x = Math.floor(Math.random() * grid.width)
      position.y = Math.floor(Math.random() * grid.height)

      // Check if the position is valid (not occupied and within view radius)
      if (
        this.players.values().some((player) => {
          return (
            player.position.x === position.x && player.position.y === position.y
          )
        })
      )
        continue

      // Check that cell is not an obstacle
      const cell = grid.get(position.x, position.y)
      if (cell && cell.length === 1) {
        // If the cell has valid tiles, we can use this position
        if (cell[0].type !== 'obstacle') break
      }
    }

    const player: Player = {
      id,
      name,
      lastUpdate: new Date(),
      position: position,
    }

    this.players.set(id, player)
    return position
  }

  public removePlayer(id: string): void {
    this.players.delete(id)
  }

  public updatePlayerPosition(id: string, position: Position): void {
    const player = this.players.get(id)

    if (!player) {
      throw new Error(`Player with id ${id} does not exist`)
    }

    const oldPosition = structuredClone(player.position)

    // Throw an error if the new position is out of bounds
    const grid = this.gameWorld.getGrid()
    if (
      position.x < 0 ||
      position.x >= grid.width ||
      position.y < 0 ||
      position.y >= grid.height
    ) {
      throw new Error(
        `Position ${JSON.stringify(
          position
        )} is out of bounds of the game world`
      )
    }

    // Throw an error if the player is trying to move to a position that is already occupied
    for (const otherPlayer of this.players.values()) {
      if (
        otherPlayer.id !== id &&
        otherPlayer.position.x === position.x &&
        otherPlayer.position.y === position.y
      ) {
        throw new Error(
          `Position ${JSON.stringify(position)} is already occupied by player ${
            otherPlayer.id
          }`
        )
      }
    }

    // Throw an error if the player is trying to move to a position that is not adjacent to their current position
    if (
      Math.abs(position.x - oldPosition.x) > 1 ||
      Math.abs(position.y - oldPosition.y) > 1
    ) {
      throw new Error(
        `Player ${id} can only move to adjacent positions, not ${JSON.stringify(
          position
        )}`
      )
    }

    // Update the player's position and last update time
    player.position = position
    player.lastUpdate = new Date()
  }

  public resetPlayers(gameWorld: GameWorld): void {
    this.gameWorld = gameWorld
    this.players.clear()

    // Reset player positions to a default state
    for (const player of this.players.values()) {
      this.addPlayer(player.id, player.name)
    }
  }

  public getPlayer(id: string): Player | undefined {
    return this.players.get(id)
  }

  public getAllPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  public cleanupIdlePlayers(): void {
    const now = new Date()
    for (const [id, player] of this.players.entries()) {
      if (
        player.lastUpdate &&
        now.getTime() - player.lastUpdate.getTime() > IDLE_TIMEOUT
      ) {
        this.players.delete(id)
      }
    }
  }

  public getPlayerPositions(): Record<string, Position | undefined> {
    const positions: Record<string, Position | undefined> = {}
    for (const [id, player] of this.players.entries()) {
      positions[id] = player.position
    }
    return positions
  }
}
