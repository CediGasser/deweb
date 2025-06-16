import { Socket, Tile } from '../shared/types.ts'

export interface RawTile {
  name: string
  sockets: [string, string, string, string] // [top, right, bottom, left]
  rotationVariants: number[]
  type?: string
  occurance?: number // Relative frequency of this tile
}

export class TileSet {
  public tiles: Tile[]

  constructor(rawTiles: RawTile[]) {
    this.tiles = this.generateVariants(rawTiles)
  }

  private generateVariants(raw: RawTile[]): Tile[] {
    const rotated = (
      s: [Socket, Socket, Socket, Socket],
      r: number
    ): [Socket, Socket, Socket, Socket] => {
      const [T, R, B, L] = s
      switch (r) {
        case 90:
          return [L, T, R, B]
        case 180:
          return [B, L, T, R]
        case 270:
          return [R, B, L, T]
        default:
          return s
      }
    }

    return raw.flatMap(
      ({
        name,
        sockets,
        rotationVariants,
        type = 'default',
        occurance = 1,
      }) => {
        const tiles = rotationVariants.map((r) => ({
          name,
          sockets: rotated(sockets, r),
          rotation: r,
          type: type as Tile['type'],
        }))

        const result: Tile[] = []

        // Add multiple instances based on occurance
        for (let i = 0; i < occurance; i++) {
          result.push(...tiles)
        }
        return result
      }
    )
  }
}
