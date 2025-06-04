type Socket = string
type TileType = 'default' | 'obstacle'

export interface Tile {
  name: string
  sockets: [Socket, Socket, Socket, Socket] // [top, right, bottom, left]
  rotation: number // 0, 90, 180, 270
  type: TileType
}

export interface Position {
  x: number
  y: number
}

export type RelativePosition = 'top' | 'right' | 'bottom' | 'left'

export type SerializedTile = { x: number; y: number; tile: Tile }

export type Player = {
  id: string
  name: string
  position: Position
}
