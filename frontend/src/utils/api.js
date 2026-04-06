import axios from 'axios'

export async function aiQuery(payload) {
  const res = await axios.post('/query-router', payload, {
    headers: { 'Content-Type': 'application/json' }
  })
  return res.data
}

export function setAuthToken(token) {
  if (token) {
    const raw = typeof token === 'string' && token.startsWith('Bearer ') ? token.split(' ', 2)[1] : token
    axios.defaults.headers.common['Authorization'] = `Bearer ${raw}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export async function loginApi(credentials) {
  const res = await axios.post('/api/auth/login', credentials, {
    headers: { 'Content-Type': 'application/json' }
  })
  const data = res.data
  if (data && data.token) {
    try {
      const raw = typeof data.token === 'string' && data.token.startsWith('Bearer ') ? data.token.split(' ',2)[1] : data.token
      localStorage.setItem('edusx_token', raw)
      setAuthToken(raw)
    } catch (e) {
      console.warn('Unable to persist token to localStorage', e)
    }
  }
  return data
}

export function logout() {
  localStorage.removeItem('edusx_token')
  setAuthToken(null)
}
