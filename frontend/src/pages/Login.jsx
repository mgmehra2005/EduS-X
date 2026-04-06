import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginApi } from '../utils/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!email || !password) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }
    
    try {
      const res = await loginApi({ email, password })
      if (res && res.token) {
        navigate('/home')
      } else {
        setError(res?.error || 'Login failed')
      }
    } catch (err) {
      setError('Login error: ' + (err.response?.data?.error || err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img src="/static/resources/images/logo.svg" alt="Eduba Logo" className="h-12" />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Sign In</h2>
          {error && <div className="mb-4 text-sm text-red-300 bg-red-900/30 p-2 rounded">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-white/80 mb-1">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 placeholder:text-white/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-white/80 mb-1">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 placeholder:text-white/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded text-white font-medium hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-white/70">Don't have an account? <Link to="/register" className="text-white underline">Create one</Link></p>
        </div>

        <footer className="mt-6 text-center text-sm text-white/50">© 2025 Eduba</footer>
      </div>
    </div>
  )
}
