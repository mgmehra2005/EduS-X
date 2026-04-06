import axios from 'axios'

// Configure axios defaults
const apiClient = axios.create({
  baseURL: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
})

export async function aiQuery(payload) {
  try {
    const res = await apiClient.post('/api/query', payload)
    return res.data
  } catch (error) {
    console.error('AI Query Error:', error.response?.data || error.message)
    throw error
  }
}

export function setAuthToken(token) {
  if (token) {
    const raw = typeof token === 'string' && token.startsWith('Bearer ') ? token.split(' ', 2)[1] : token
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${raw}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

export async function loginApi(credentials) {
  try {
    const res = await apiClient.post('/api/auth/login', credentials)
    const data = res.data
    if (data && data.token) {
      try {
        const raw = typeof data.token === 'string' && data.token.startsWith('Bearer ') ? data.token.split(' ', 2)[1] : data.token
        localStorage.setItem('edusx_token', raw)
        setAuthToken(raw)
      } catch (e) {
        console.warn('Unable to persist token to localStorage', e)
      }
    }
    return data
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message)
    throw error
  }
}

export async function registerApi(userData) {
  try {
    const res = await apiClient.post('/api/auth/register', userData)
    return res.data
  } catch (error) {
    console.error('Register Error:', error.response?.data || error.message)
    throw error
  }
}

export async function logoutApi() {
  try {
    const res = await apiClient.post('/api/auth/logout')
    localStorage.removeItem('edusx_token')
    setAuthToken(null)
    return res.data
  } catch (error) {
    console.error('Logout Error:', error.response?.data || error.message)
    localStorage.removeItem('edusx_token')
    setAuthToken(null)
  }
}

export async function getExercises(conceptId) {
  try {
    const res = await apiClient.get('/api/exercises', {
      params: { concept_id: conceptId }
    })
    return res.data
  } catch (error) {
    console.error('Get Exercises Error:', error.response?.data || error.message)
    throw error
  }
}

export async function submitAnswers(data) {
  try {
    const res = await apiClient.post('/api/submit-answers', data)
    return res.data
  } catch (error) {
    console.error('Submit Answers Error:', error.response?.data || error.message)
    throw error
  }
}

export function logout() {
  localStorage.removeItem('edusx_token')
  setAuthToken(null)
}
