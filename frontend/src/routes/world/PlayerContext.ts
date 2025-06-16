import { getContext, setContext } from 'svelte'
import type { Player } from '$lib/types'

const key = {}

export function setPlayerContext(user: Player) {
  setContext(key, user)
}

export function getPlayerContext() {
  return getContext(key) as Player
}
