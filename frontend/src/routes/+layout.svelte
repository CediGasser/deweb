<script lang="ts">
  import { createWorld } from '$lib/api'
  import '../app.css'
  import type { Snippet } from 'svelte'

  interface Props {
    children?: Snippet
  }
  const { children }: Props = $props()

  ;(globalThis as any).recreateWorld = createWorld
</script>

{@render children?.()}
