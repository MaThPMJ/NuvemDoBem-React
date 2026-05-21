const BASE_URL = 'https://javasprint.onrender.com'

export async function apiFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('nuvem_user')
    window.location.href = '/login'
    throw new Error('Sessão expirada')
  }

  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body?.message ?? body?.erro ?? body?.error ?? JSON.stringify(body)
    } catch {
      detail = await res.text().catch(() => '')
    }
    throw new Error(detail || `Erro ${res.status} em ${path}`)
  }

  if (res.status === 204) return null
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) return res.json()
  return null
}
