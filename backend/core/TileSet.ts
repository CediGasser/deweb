import type { Tile } from '../shared/types.js'

export interface RawTile {
  name: string
  sockets: [string, string, string, string] // [top, right, bottom, left]
  rotationVariants: number[]
  type?: string
}

export class TileSet {
  public tiles: Tile[]

  constructor(rawTiles: RawTile[]) {
    this.tiles = this.generateVariants(rawTiles)
  }

  private generateVariants(raw: RawTile[]): Tile[] {
    const rotated = (
      s: [string, string, string, string],
      r: number
    ): [string, string, string, string] => {
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
      ({ name, sockets, rotationVariants, type = 'default' }) =>
        rotationVariants.map((r) => ({
          name,
          sockets: rotated(sockets, r),
          rotation: r,
          type,
        }))
    )
  }
}
