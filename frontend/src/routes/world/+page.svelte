<script lang="ts">
  let playerInfo: null | any = $state(null)

  $effect(() => {
    // Fetch player info when the component mounts
    fetchPlayerInfo().catch((error) => {
      console.error('Error fetching player info:', error)
    })
  })

  async function fetchPlayerInfo() {
    // Simulate an API call to fetch player info
    const response = await fetch('/api/player-info', {
      credentials: 'include',
    })
    if (response.ok) {
      playerInfo = await response.json()
    } else {
      throw new Error('Failed to fetch player info')
    }
  }
</script>

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
