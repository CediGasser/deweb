import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getCookie, setCookie } from 'hono/cookie'
import { GameWorld } from './game/GameWorld.ts'
import { type RawTile, TileSet } from './core/TileSet.ts'

const app = new Hono()
app.use('*', cors({ origin: ['http://localhost:5173'], credentials: true }))

const rawTiles: RawTile[] = []
const tileSet = new TileSet(rawTiles)

const gameWorld = new GameWorld(tileSet, 100, 100)

app.get('/api/player-info', (c) => {
  const playerId = getCookie(c, 'playerId')
  if (!playerId) {
    return c.json({ error: 'PlayerID Cookie not set' }, 404)
  }
  const player = gameWorld.playerManager.getPlayer(playerId)
  if (!player) {
    return c.json({ error: 'Player not found' }, 404)
  }
  return c.json({
    id: player.id,
    name: player.name,
    position: player.position,
  })
})

app.post('/api/create-player', (c) => {
  const id = crypto.randomUUID()
  let name = c.req.query('name')

  if (!name) {
    name = `Player-${id.slice(0, 8)}`
  }

  const position = gameWorld.playerManager.addPlayer(id, name)

  setCookie(c, 'playerId', id, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'Lax',
  })

  return c.json({
    id,
    name,
    position,
  })
})

app.post('/api/load-chunk', (c) => {
  const { x, y } = c.req.query()
  const playerId = getCookie(c, 'playerId')

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
