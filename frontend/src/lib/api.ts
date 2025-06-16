import { PUBLIC_BACKEND_URL } from '$env/static/public'
import type { Player, Position, SerializedTile } from './types'

const callApi = async (path: string, options: RequestInit = {}) => {
  const baseUrl = PUBLIC_BACKEND_URL || 'http://localhost:8000'
  const url = new URL(path, baseUrl)

  // Get player ID from local storage and set custom header
  const playerId = localStorage.getItem('playerId')

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Player-ID': playerId || '',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `API call failed: ${response.status} ${response.statusText} - ${errorText}`
    )
  }
  return response.json()
}

export const getPlayerInfo = () => {
  return callApi('/api/player-info')
}

export const createWorld = () => {
  return callApi('/api/create-world', {
    method: 'POST',
  })
}

export const createPlayer = async (name?: string) => {
  if (name?.trim()) {
    const searchParams = new URLSearchParams({
      name: name.trim(),
    }).toString()

    try {
      const result = await callApi(`/api/create-player?${searchParams}`, {
        method: 'POST',
      })

      // Store player ID in local storage for future requests
      localStorage.setItem('playerId', result.id)
      return result as Player
    } catch (error) {
      console.error('Error creating player:', error)
      throw error
    }
  }
}

type LoadChunkResponse = {
  tiles: SerializedTile[]
  playerPosition: Position
}

export const loadChunk = async (position: Position) => {
  const result = await callApi('/api/load-chunk', {
    method: 'POST',
    body: JSON.stringify(position),
  })
  return result as LoadChunkResponse
}
