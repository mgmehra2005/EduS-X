import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../utils/api'

export default function UserMenu({ email }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function handleLogout() {
    try {
      logout()
    } catch (e) {
      console.warn(e)
    }
    setOpen(false)
    navigate('/login')
  }

  return (
    <div style={{ position: 'relative' }}>
      <button aria-label="user-menu" onClick={() => setOpen(s => !s)} style={{ borderRadius: '50%', width:40, height:40 }}>
        <span role="img" aria-label="user">👤</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 48, background: '#fff', border: '1px solid #ddd', borderRadius: 6, padding: 8, minWidth: 160, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <div style={{ padding: '6px 8px', borderBottom: '1px solid #eee' }}>{email || 'You'}</div>
          <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '6px 8px', background: 'none', border: 'none' }}>Logout</button>
        </div>
      )}
    </div>
  )
}
