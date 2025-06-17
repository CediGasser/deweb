import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { compress } from 'hono/compress'
import { getCookie, setCookie } from 'hono/cookie'
import { GameWorld } from './game/GameWorld.ts'
import { type RawTile, TileSet } from './core/TileSet.ts'
import overworldTiles from './core/overworld_tiles.json' with { type: 'json' }
import { PlayerManager } from "./game/PlayerManager.ts";
import { GRID_HEIGHT, GRID_WIDTH } from "./shared/constants.ts";
import { Server } from "https://deno.land/x/socket_io@0.2.1/mod.ts";


const app = new Hono()
app.use('*', cors({ origin: ['http://localhost:5173'], credentials: true }))
app.use(compress())

//const tileSet = new TileSet(directedTiles as RawTile[])
const tileSet = new TileSet(overworldTiles as RawTile[])

let gameWorld = new GameWorld(tileSet, GRID_WIDTH, GRID_HEIGHT)
const playerManager = new PlayerManager(gameWorld)

gameWorld.generateWorld()

// Initialize Socket.IO server
const io = new Server({
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.info('📶 client connected:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('❌ disconnected', socket.id, reason);
  });
});

app.get('/api/health', (c) => {
  return c.json({ status: 'ok' })
})

app.get('/api/player-info', (c) => {
  const playerId = c.req.header('X-Player-ID') || getCookie(c, 'playerId')

  if (!playerId) {
    return c.json({ error: 'PlayerID Cookie not set' }, 404)
  }
  const player = playerManager.getPlayer(playerId)
  if (!player) {
    return c.json({ error: 'Player not found' }, 404)
  }
  return c.json({
    id: player.id,
    name: player.name,
    position: player.position,
  })
})

app.post('/api/create-world', (c) => {
  const newGameWorld = new GameWorld(tileSet, GRID_WIDTH, GRID_HEIGHT)
  newGameWorld.generateWorld()

  gameWorld = newGameWorld
  playerManager.resetPlayers(gameWorld)

  console.info('🌍 New game world created with dimensions:', GRID_WIDTH, 'x', GRID_HEIGHT)

  io.emit('worldCreated', {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
  })

  return c.json({
    message: 'World created successfully',
  })
})

app.post('/api/create-player', (c) => {
  const id = crypto.randomUUID()
  let name = c.req.query('name')

  if (!name) {
    name = `Player-${id.slice(0, 8)}`
  }

  const position = playerManager.addPlayer(id, name)

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

app.post('/api/load-chunk', async (c) => {
  const { x, y } = (await c.req.json()) as { x: string, y: string }
  const playerId = c.req.header('X-Player-ID') || getCookie(c, 'playerId')

  const position = {
    x: parseInt(x, 10),
    y: parseInt(y, 10),
  }

  // Validate player ID and coordinates
  if (!playerId || isNaN(position.x) || isNaN(position.y)) {
    return c.json({ error: 'Invalid player ID or coordinates' }, 400)
  }

  // load the chunk around the new position
  const tiles = await gameWorld.getChunk(position)

  try {
    await playerManager.updatePlayerPosition(playerId, position)
  } catch (error) {
    return c.json({ error }, 500)
  }

  // Emit the player movement to all connected clients
  const player = playerManager.getPlayer(playerId)
  io.emit('playerMoved', player)

  return c.json({
    tiles,
    playerPosition: position,
  })
})

// Wrapping the Hono app with Socket.IO handler
const handler = io.handler(app.fetch)

Deno.serve(handler)
