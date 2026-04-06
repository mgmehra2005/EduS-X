import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutApi } from '../utils/api'

export default function UserMenu({ email }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logoutApi()
    } catch (e) {
      console.warn('Logout error (continuing anyway):', e)
    }
    setOpen(false)
    navigate('/login')
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        aria-label="user-menu" 
        onClick={() => setOpen(s => !s)} 
        style={{ 
          borderRadius: '50%', 
          width: 40, 
          height: 40,
          border: 'none',
          background: '#f0f0f0',
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span role="img" aria-label="user">👤</span>
      </button>
      {open && (
        <div style={{ 
          position: 'absolute', 
          right: 0, 
          top: 48, 
          background: '#fff', 
          border: '1px solid #ddd', 
          borderRadius: 6, 
          padding: 0,
          minWidth: 180, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', color: '#666', fontSize: '14px' }}>
            {email || 'Account'}
          </div>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              padding: '12px 16px', 
              background: 'none', 
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#d32f2f',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
