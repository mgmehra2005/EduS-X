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
      // Normalize and attach the original user query so Solution page can show it
      if (res) {
        // Expected shape: { resolved_solution: { source, data } }
        let storeObj = {}
        if (res.resolved_solution) {
          // make a shallow copy
          const rs = { ...res.resolved_solution }
          // ensure data is an object
          if (typeof rs.data === 'string') {
            try { rs.data = JSON.parse(rs.data) } catch (e) { rs.data = { raw: rs.data } }
          }
          rs.data = rs.data || {}
          rs.data.user_query = query
          storeObj.resolved_solution = rs
        } else {
          // fallback: put entire response into data
          storeObj.resolved_solution = { source: 'ai', data: { ...(res.data || res), user_query: query } }
        }

        sessionStorage.setItem('resolved_solution', JSON.stringify(storeObj))
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
    <div className="min-h-screen bg-neutral-900 text-white">
      <header className="border-b border-white/6">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/static/resources/images/logo.svg" alt="Eduba Logo" className="h-10" />
            <span className="text-lg font-semibold">EduS-X</span>
          </div>
          <div>
            {!isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm text-white/80 hover:underline">Login</Link>
                <Link to="/register" className="text-sm bg-white/5 px-3 py-2 rounded hover:bg-white/10">Sign up</Link>
              </div>
            ) : (
              <UserMenu email={userEmail} />
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          {/* <h1 className="text-4xl md:text-5xl font-bold mb-4">Personalized solutions, step-by-step</h1>
          <p className="text-white/70 mb-6">Get concise explanations and worked solutions tailored to your level.</p> */}

          {error && <div className="mb-4 text-sm text-red-300 bg-red-900/30 p-3 rounded">{error}</div>}

          {!isLoggedIn ? (
            <div className="bg-white/3 border border-white/6 rounded p-6">
              <p className="text-white/80">Please <Link to="/login" className="underline">log in</Link> or <Link to="/register" className="underline">create an account</Link> to submit queries and save progress.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  name="query"
                  id="queryInput"
                  placeholder="Enter your problem statement here..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 px-4 py-3 rounded bg-white/5 border border-white/10 placeholder:text-white/50 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  id="processQuery"
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="w-full sm:w-40 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded text-white font-medium disabled:opacity-60"
                >
                  {loading ? 'Processing...' : 'Get Solution'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-white/6">
        <div className="container mx-auto px-6 py-6 text-center text-white/60">© 2025 Eduba - Personalized Learning Solutions</div>
      </footer>
    </div>
  )
}
