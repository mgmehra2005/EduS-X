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
    <div>
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="logo"><img src="/static/resources/images/logo.svg" alt="Eduba Logo"/></div>
          <div>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </header>
      <main>
        <h2>Create Account</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              id="name"
              type="text"
              placeholder="Your name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
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
              placeholder="At least 8 characters" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </main>
      <footer>
        <p>© 2025 Eduba</p>
      </footer>
    </div>
  )
}
