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
        navigate('/')
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
    <div>
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="logo"><img src="/static/resources/images/logo.svg" alt="Eduba Logo"/></div>
          <div>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
      </header>
      <main>
        <h2>Sign In</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email"
              placeholder="your@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password"
              placeholder="Your password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p>Don't have an account? <Link to="/register">Create one</Link></p>
      </main>
      <footer>
        <p>© 2025 Eduba</p>
      </footer>
    </div>
  )
}
