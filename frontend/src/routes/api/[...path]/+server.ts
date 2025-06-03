import type { RequestHandler } from './$types'
import { PUBLIC_BACKEND_URL } from '$env/static/public'

// Forward API calls to the backend
export const fallback: RequestHandler = async ({ params, request, url }) => {
  const { path } = params
  if (!path) {
    return new Response('Path parameter is required', { status: 400 })
  }

  console.log('Forwarding request to backend:', path)

  const newUrl = new URL('/api/' + path, PUBLIC_BACKEND_URL)
  newUrl.search = url.search

  const newRequest = new Request(newUrl, request)

  newRequest.headers.set('host', new URL(PUBLIC_BACKEND_URL).host)

  return fetch(newRequest)
}
