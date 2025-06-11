<script lang="ts">
  import type {
    Player,
    Position,
    SerializedTile,
  } from '../../../../shared/types'
  import WfcComponent from './WfcComponent.svelte'
  import { setPlayerContext } from './PlayerContext'

  let playerInfo: Player = $state({} as Player)
  let tiles: any[] = $state([])

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
  <h1>Game</h1>
  <p>Welcome to the game world!</p>
  {#if playerInfo}
    <p>Player Name: {playerInfo.name}</p>
    <p>Player Id: {playerInfo.id}</p>
    <p>Player Position: {JSON.stringify(playerInfo.position)}</p>
  {:else}
    <p>Loading player info...</p>
  {/if}

  <WfcComponent {tiles} />
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
</style>
