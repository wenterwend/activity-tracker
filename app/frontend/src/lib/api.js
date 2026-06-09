import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

export async function apiFetch(path, { body, method = 'GET', ...opts } = {}) {
  const token = await getToken()
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.status === 204 ? null : res.json()
}
