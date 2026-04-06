import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerApi } from '../utils/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!name || !email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }
    
    try {
      const res = await registerApi({ email, password, name })
      if (res && (res.status === 'ok' || res.message)) {
        alert('Registered successfully — please log in')
        navigate('/login')
      } else if (res && res.error) {
        setError(res.error)
      } else {
        setError('Registration failed')
      }
    } catch (err) {
      setError('Register error: ' + (err.response?.data?.error || err.message || 'Unknown error'))
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
          <h2 className="text-2xl font-semibold mb-4">Create Account</h2>
          {error && <div className="mb-4 text-sm text-red-300 bg-red-900/30 p-2 rounded">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm text-white/80 mb-1">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 placeholder:text-white/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

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
                placeholder="At least 8 characters"
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-white/70">Already have an account? <Link to="/login" className="text-white underline">Sign in</Link></p>
        </div>

        <footer className="mt-6 text-center text-sm text-white/50">© 2025 Eduba</footer>
      </div>
    </div>
  )
}
