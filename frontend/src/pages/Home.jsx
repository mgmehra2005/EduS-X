import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { aiQuery } from '../utils/api'
import UserMenu from '../components/UserMenu'


export default function Home() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('edusx_token')
    setIsLoggedIn(!!token)
    // optionally decode token to extract email if included; otherwise skip
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await aiQuery({ query })
      // store the resolved_solution payload for the Solution page
      sessionStorage.setItem('resolved_solution', JSON.stringify(res))
      navigate('/solution')
    } catch (err) {
      alert('Error: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="logo"><img src="/static/resources/images/logo.png" alt="Eduba Logo"/></div>
          <div>
            {!isLoggedIn ? (
              <>
                <Link to="/login" style={{ marginRight: 8 }}>Login</Link>
                <Link to="/register">Sign up</Link>
              </>
            ) : (
              <UserMenu email={userEmail} />
            )}
          </div>
        </div>
      </header>
      <main>
        <h1>EduS-X</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" name="query" id="queryInput" placeholder="Problem Statement" value={query} onChange={e => setQuery(e.target.value)} style={{width:'60%'}} />
          <button id="processQuery" type="submit" disabled={loading || !query.trim()}>{loading ? 'Thinking...' : '>'}</button>
        </form>
      </main>
      <footer>
        <p>© 2025 Eduba</p>
      </footer>
    </div>
  )
}
