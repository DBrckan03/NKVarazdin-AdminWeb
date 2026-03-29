import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { isAuthenticated, logout } from '../utils/auth'

export default function DashboardPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        padding: '32px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          background: '#fff',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        <p>Uspješno si prijavljen u NK Varaždin admin.</p>

        <button
          onClick={handleLogout}
          style={{
            marginTop: '16px',
            background: '#f97316',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 16px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Odjava
        </button>
      </div>
    </div>
  )
}