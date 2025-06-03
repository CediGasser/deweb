export interface Tile {
  name: string
  sockets: [string, string, string, string] // [top, right, bottom, left]
  rotation: number // 0, 90, 180, 270
  type: string
}

export interface Position {
  x: number
  y: number
}

export type RelativePosition = 'top' | 'right' | 'bottom' | 'left'
