<script lang="ts">
  import { goto } from '$app/navigation'
  import { createPlayer, getPlayerInfo } from '$lib/api'

  let playerName = $state('')

  let playerInfo: null | any = getPlayerInfo()

  async function startGame() {
    await goto('/world')
  }

  async function handlePlay() {
    const player = await createPlayer(playerName)

    if (player) {
      // Navigate to the game world or next step
      await goto('/world')
    }
  }
</script>

<main>
  <h1>Glitchy World</h1>
  {#await playerInfo then player}
    <p>Welcome back, <span class="player-name">{player.name}</span>!</p>
    <p>Ready to continue your adventure?</p>
    <button onclick={startGame}>Continue</button>
  {:catch}
    <label for="playerName">Player Name:</label>
    <input
      id="playerName"
      type="text"
      bind:value={playerName}
      placeholder="Enter your name"
      autocomplete="off"
    />
    <button onclick={handlePlay} disabled={!playerName.trim()}> Play </button>
  {/await}
</main>

<style>
  main {
    max-width: 350px;
    margin: 100px auto;
    background-color: #2a2a2a;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  h1 {
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  input[type='text'] {
    width: 80%;
    padding: 0.5rem;
    margin-bottom: 1.2rem;
    border: 1px solid #bbb;
    border-radius: 6px;
    font-size: 1rem;
    outline: none;
    transition: border 0.2s;
  }
  input[type='text']:focus {
    border-color: #0070f3;
  }
  button {
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
    background: #0070f3;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    width: 100%;
  }
  button:disabled {
    background: #aaa;
    cursor: not-allowed;
  }
  .player-name {
    font-weight: bold;
    color: #0070f3;
  }
</style>
