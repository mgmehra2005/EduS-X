import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { aiQuery } from '../utils/api'
import UserMenu from '../components/UserMenu'

export default function Home() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('edusx_token')
    setIsLoggedIn(!!token)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    
    if (!query.trim()) {
      setError('Please enter a problem statement')
      return
    }
    
    if (!isLoggedIn) {
      setError('Please log in to submit a query')
      return
    }
    
    setLoading(true)
    try {
      const res = await aiQuery({ query })
      if (res && res.data) {
        sessionStorage.setItem('resolved_solution', JSON.stringify(res))
        navigate('/solution')
      } else if (res && res.error) {
        setError(res.error)
      } else {
        setError('Failed to process query')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.')
        navigate('/login')
      } else {
        setError('Error: ' + (err.response?.data?.error || err.message || 'Unknown error'))
      }
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
            {!isLoggedIn ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Sign up</Link>
              </>
            ) : (
              <UserMenu email={userEmail} />
            )}
          </div>
        </div>
      </header>
      <main>
        <h1>Welcome to EduS-X</h1>
        <p style={{ marginBottom: '24px', color: '#666' }}>Get personalized solutions and explanations for your problems</p>
        
        {error && <div className="error">{error}</div>}
        
        {!isLoggedIn ? (
          <div className="error">
            <p>Please <Link to="/login">log in</Link> or <Link to="/register">create an account</Link> to get started</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
            <div className="form-group" style={{ display: 'flex', gap: '8px', margin: '0' }}>
              <input 
                type="text" 
                name="query" 
                id="queryInput" 
                placeholder="Enter your problem statement here..." 
                value={query} 
                onChange={e => setQuery(e.target.value)}
                style={{ flex: 1, fontSize: '16px' }}
              />
              <button 
                id="processQuery" 
                type="submit" 
                disabled={loading || !query.trim()}
                style={{ width: '120px' }}
              >
                {loading ? 'Processing...' : 'Get Solution'}
              </button>
            </div>
          </form>
        )}
      </main>
      <footer>
        <p>© 2025 Eduba - Personalized Learning Solutions</p>
      </footer>
    </div>
  )
}
