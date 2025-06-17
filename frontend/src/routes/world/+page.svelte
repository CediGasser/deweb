<script lang="ts">
  import type { Player, Position, SerializedTile } from '$lib/types'
  import WfcComponent from './WfcComponent.svelte'
  import { setPlayerContext } from './PlayerContext'
  import { io } from 'socket.io-client'
  import { GRID_HEIGHT, GRID_WIDTH } from '$lib/constants'
  import { getPlayerInfo, loadChunk } from '$lib/api'
  import { BASE_URL } from '$lib/api'

  let playerInfo: Player = $state({} as Player)
  let tiles: SerializedTile[] = $state([])
  let otherPlayers: Player[] = $state([])

  const socket = io(BASE_URL ?? undefined)

  socket.on('playerMoved', (data: Player) => {
    const playerIndex = otherPlayers.findIndex((p) => p.id === data.id)
    if (data.id === playerInfo.id) {
      return // Ignore own movements
    } else if (playerIndex !== -1) {
      otherPlayers[playerIndex].position = data.position
    } else {
      // If the player is not found, add them to the list
      otherPlayers.push(data)
    }
  })

  setPlayerContext(playerInfo)

  $effect(() => {
    // Fetch player info when the component mounts
    fetchPlayerInfo()
      .then(() => {
        // Fetch tiles when the component mounts
        fetchTiles(playerInfo.position).catch((error) => {
          console.error('Error fetching tiles:', error)
        })
      })
      .catch((error) => {
        console.error('Error fetching player info:', error)
      })
  })

  async function handleKeydown(event: KeyboardEvent) {
    const newPosition = { ...playerInfo.position }
    if (event.key === 'ArrowUp' || event.key === 'w') {
      newPosition.y -= 1
    } else if (event.key === 'ArrowDown' || event.key === 's') {
      newPosition.y += 1
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
      newPosition.x -= 1
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
      newPosition.x += 1
    }

    // Check if the new position is valid
    if (!canMoveTo(newPosition)) {
      return // Invalid move, do nothing
    }

    // Update player position
    playerInfo.position = newPosition

    // Fetch new tiles based on the updated position
    await fetchTiles(playerInfo.position)
  }

  function canMoveTo(position: Position): boolean {
    const tile = tiles.find(
      (cell) => cell.x === position.x && cell.y === position.y
    )?.tile

    const playerThere = otherPlayers.some(
      (player) =>
        player.position.x === position.x && player.position.y === position.y
    )

    return !!(
      // Check if the position is within bounds
      (
        position.x >= 0 &&
        position.y >= 0 &&
        position.x < GRID_WIDTH &&
        position.y < GRID_HEIGHT &&
        // Check if the tile exists (not a wall or obstacle)
        tile &&
        tile.type !== 'obstacle' &&
        // Check if no other player is already at the position
        !playerThere
      )
    )
  }

  async function fetchPlayerInfo() {
    const player = await getPlayerInfo()

    playerInfo.id = player.id
    playerInfo.name = player.name
    playerInfo.position = player.position as Position
  }

  async function fetchTiles(position: Position) {
    tiles = (await loadChunk(position)).tiles
  }
</script>

<svelte:document onkeydown={handleKeydown} />

<main>
  <WfcComponent {otherPlayers} {tiles} />
  <div class="stats">
    <h1>World</h1>
    <p>({playerInfo.position?.x}, {playerInfo.position?.y})</p>
  </div>
</main>

<style>
  main {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  h1 {
    margin-bottom: 1.5rem;
    font-size: 2rem;
    text-align: center;
  }
  .stats {
    position: absolute;
    top: 1rem;
    left: 1rem;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 1rem;
    border-radius: 8px;
    z-index: 10;
  }
  p {
    margin: 0.5rem 0;
  }
</style>
