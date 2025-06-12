<script lang="ts">
  import type {
    Player,
    Position,
    SerializedTile,
  } from '../../../../shared/types'
  import WfcComponent from './WfcComponent.svelte'
  import { setPlayerContext } from './PlayerContext'
  import { io } from 'socket.io-client'
  import { PUBLIC_BACKEND_URL } from '$env/static/public'

  let playerInfo: Player = $state({} as Player)
  let tiles: any[] = $state([])
  let otherPlayers: Player[] = $state([])

  const socket = io(PUBLIC_BACKEND_URL)

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
    if (event.key === 'ArrowUp' || event.key === 'w') {
      playerInfo.position.y -= 1
    } else if (event.key === 'ArrowDown' || event.key === 's') {
      playerInfo.position.y += 1
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
      playerInfo.position.x -= 1
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
      playerInfo.position.x += 1
    }

    // Fetch new tiles based on the updated position
    await fetchTiles(playerInfo.position)
  }

  async function fetchPlayerInfo() {
    const response = await fetch('/api/player-info')

    if (response.ok) {
      const player = await response.json()
      playerInfo.id = player.id
      playerInfo.name = player.name
      playerInfo.position = player.position as Position
    } else {
      throw new Error('Failed to fetch player info')
    }
  }

  type LoadChunkResponse = {
    tiles: SerializedTile[]
    playerPosition: Position
  }

  async function fetchTiles(position: Position) {
    const response = await fetch('/api/load-chunk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(position),
    })

    if (response.ok) {
      tiles = ((await response.json()) as LoadChunkResponse).tiles
    } else {
      throw new Error('Failed to fetch tiles')
    }
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
