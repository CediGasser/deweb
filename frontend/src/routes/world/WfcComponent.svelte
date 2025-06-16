<script lang="ts">
  import type { Player, SerializedTile } from '$lib/types'
  import { TILE_SIZE, VIEW_RADIUS } from '$lib/constants'
  import { getPlayerContext } from './PlayerContext'

  interface Props {
    tiles: SerializedTile[]
    otherPlayers: Player[]
  }
  const { tiles, otherPlayers }: Props = $props()

  const player = getPlayerContext()

  let posX = $derived(player?.position?.x || 0)
  let posY = $derived(player?.position?.y || 0)

  function isInView({ position }: Player): boolean {
    const radius = VIEW_RADIUS - 1 // Adjusted for margin
    return (
      position.x >= posX - radius &&
      position.x <= posX + radius &&
      position.y >= posY - radius &&
      position.y <= posY + radius
    )
  }

  $inspect(tiles)
  $inspect(player)
</script>

<div
  class="wrapper"
  style="--height: {TILE_SIZE * VIEW_RADIUS * 2 + TILE_SIZE}px; 
  --width: {TILE_SIZE * VIEW_RADIUS * 2 + TILE_SIZE}px;"
>
  <div class="tile-container">
    {#each tiles as tile (`${tile.x},${tile.y}`)}
      {@const offsetX = (tile.x - posX) * TILE_SIZE - TILE_SIZE / 2}
      {@const offsetY = (tile.y - posY) * TILE_SIZE - TILE_SIZE / 2}
      <img
        class="offset-element"
        style="--rotation: {tile.tile
          .rotation}deg; --offset-x: {offsetX}px; --offset-y: {offsetY}px;"
        src="/wfc-images/{tile.tile.name}"
        alt="({tile.x},{tile.y}) {tile.tile.name}"
      />
    {/each}
    <!-- Players -->
    {#if player}
      {@const offsetX = -TILE_SIZE / 2}
      {@const offsetY = -TILE_SIZE / 2}
      <img
        class="player offset-element"
        style="--rotation: 0deg; --offset-x: {offsetX}px; --offset-y: {offsetY}px;"
        src="/player.png"
        alt="Player {player.name}"
      />
    {/if}
    {#each otherPlayers.filter(isInView) as otherPlayer}
      {@const offsetX =
        (otherPlayer.position.x - posX) * TILE_SIZE - TILE_SIZE / 2}
      {@const offsetY =
        (otherPlayer.position.y - posY) * TILE_SIZE - TILE_SIZE / 2}
      <div
        data-name={otherPlayer.name}
        class="other-player offset-element"
        style="--rotation: 0deg; --offset-x: {offsetX}px; --offset-y: {offsetY}px;"
      >
        <img src="/player.png" alt="Other Player" />
      </div>
    {/each}
    <div class="vignete-overlay"></div>
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .tile-container {
    width: 0;
    height: 0;
  }

  .vignete-overlay {
    position: absolute;
    --intensity: 60%;
    background: linear-gradient(to top, black, transparent var(--intensity)),
      linear-gradient(to bottom, black, transparent var(--intensity)),
      linear-gradient(to left, black, transparent var(--intensity)),
      linear-gradient(to right, black, transparent var(--intensity));
    background-repeat: no-repeat;
    background-size:
      100% 100%,
      100% 100%,
      100% 100%,
      100% 100%;
    background-position: top, bottom, left, right;

    border: 500px solid black;

    width: var(--width);
    height: var(--height);
    transform: translateX(-50%) translateY(-50%);

    pointer-events: none;
    z-index: 2;
  }

  img {
    position: absolute;
    image-rendering: pixelated;
    z-index: 0;
    height: 100%;
    width: 100%;
  }

  img.player {
    z-index: 1;
  }

  .offset-element {
    position: absolute;
    width: 64px;
    height: 64px;
    transform: translateX(var(--offset-x)) translateY(var(--offset-y))
      rotate(var(--rotation));
    transition: transform 0.1s ease-in-out;
  }

  .other-player::after {
    content: attr(data-name);
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-size: 12px;
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 2px 4px;
    border-radius: 4px;
    opacity: 0.8;
  }
</style>
