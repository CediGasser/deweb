import { Hono } from 'hono'
import { GameWorld } from './game/GameWorld.ts'
import { type RawTile, TileSet } from './core/TileSet.ts'

const app = new Hono()

const rawTiles: RawTile[] = []
const tileSet = new TileSet(rawTiles)

const gameWorld = new GameWorld(tileSet, 100, 100)

app.post('/api/create-player', (c) => {
  const playerId = c.req.header('X-Player-Id') || crypto.randomUUID()
  const playerName = c.req.header('X-Player-Name') || 'Anon'
  const position = gameWorld.playerManager.addPlayer(playerId, playerName)

  return c.json({
    playerId,
    playerName,
    position,
  })
})

app.post('/api/load-chunk', (c) => {
  const { x, y } = c.req.query()
  const playerId = c.req.header('X-Player-Id')

  const position = {
    x: parseInt(x, 10),
    y: parseInt(y, 10),
  }

  // Validate player ID and coordinates
  if (!playerId || isNaN(position.x) || isNaN(position.y)) {
    return c.json({ error: 'Invalid player ID or coordinates' }, 400)
  }

  // Load the chunk around the player's position
  gameWorld.playerManager.updatePlayerPosition(playerId, position)

  return c.text('Hello Hono!')
})

Deno.serve(app.fetch)
