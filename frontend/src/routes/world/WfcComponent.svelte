<script lang="ts">
  import type { Player, SerializedTile } from '../../../../shared/types'
  import { TILE_SIZE } from '../../../../shared/constants'
  import { getPlayerContext } from './PlayerContext'

  interface Props {
    tiles: SerializedTile[]
    otherPlayers: Player[]
  }
  const { tiles, otherPlayers }: Props = $props()

  const player = getPlayerContext()

  let posX = $derived(player?.position?.x || 0)
  let posY = $derived(player?.position?.y || 0)

  $inspect(tiles)
  $inspect(player)
</script>

<div class="wrapper">
  <div class="tile-container">
    {#each tiles as tile (`${tile.x},${tile.y}`)}
      {@const offsetX = (tile.x - posX) * TILE_SIZE}
      {@const offsetY = (tile.y - posY) * TILE_SIZE}
      <img
        style="--rotation: {tile.tile
          .rotation}deg; --offset-x: {offsetX}px; --offset-y: {offsetY}px;"
        src="/wfc-images/{tile.tile.name}"
        alt="({tile.x},{tile.y}) {tile.tile.name}"
      />
    {/each}
    <!-- Players -->
    {#if player}
      <img
        class="player"
        style="--offset-x: 0px; --offset-y: 0px;"
        src="/player.png"
        alt="Player"
      />
    {/if}
    {#each otherPlayers as otherPlayer}
      {@const offsetX = (otherPlayer.position.x - posX) * TILE_SIZE}
      {@const offsetY = (otherPlayer.position.y - posY) * TILE_SIZE}
      <img
        class="other-player"
        style="--rotation: 0deg; --offset-x: {offsetX}px; --offset-y: {offsetY}px;"
        src="/player.png"
        alt="Other Player"
      />
    {/each}
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .tile-container {
    width: 0;
    height: 0;
  }

  img {
    position: absolute;
    width: 64px;
    height: 64px;
    transform: translateX(var(--offset-x)) translateY(var(--offset-y))
      rotate(var(--rotation));
    image-rendering: pixelated;
    transition: transform 0.1s ease-in-out;
  }

  img.player {
    z-index: 1;
  }
</style>
