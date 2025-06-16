import type { RequestHandler } from '@sveltejs/kit'
import { PUBLIC_BACKEND_URL } from '$env/static/public'

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const forward = (base: string): RequestHandler => {
  return async ({ params, request, url, fetch }) => {
    const { path } = params
    if (!path) {
      return new Response('Path parameter is required', { status: 400 })
    }

    console.log('Forwarding request to backend:', path)

    const newUrl = new URL(base + path, PUBLIC_BACKEND_URL)
    newUrl.search = url.search

    // Create a new request with the updated URL and original method/body
    const newRequest = new Request(newUrl, {
      method: request.method,
      body: request.body,
    })

    newRequest.headers.set('cookie', request.headers.get('cookie') || '')
    newRequest.headers.set('host', new URL(PUBLIC_BACKEND_URL).host)

    const response = await fetch(newRequest)
    const clonedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
    })

    clonedResponse.headers.set(
      'set-cookie',
      response.headers.get('set-cookie') || ''
    )

    return clonedResponse
  }
}
