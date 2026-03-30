import { type FormEvent, useState } from 'react'
import './LoginPage.css'

type LoginResponse = {
  accessToken: string
  refreshToken: string
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()

    if (loading) return

    setError('')
    setLoading(true)

    try {
      console.log('Šaljem login request...')

      const response = await fetch('/auth-api/api/auth/login', {
        method: 'POST',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      console.log('Login status:', response.status)

      if (!response.ok) {
        throw new Error(`Prijava nije uspjela. Status: ${response.status}`)
      }

      const data: LoginResponse = await response.json()
      console.log('Login parsed:', data)

      // spremi tokene
      localStorage.setItem('nkvarazdin_user', JSON.stringify(data))

      // redirect
      window.location.replace('/')
    } catch (err) {
      console.error('Login error:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Došlo je do greške pri prijavi.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <img src="/logo.png" alt="NK Varaždin" className="login-logo" />

        <div className="login-card">
          <h1 className="login-title">Prijava</h1>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Unesite email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Lozinka</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Unesite lozinku"
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" disabled={loading} className="login-button">
              {loading ? 'Prijava...' : 'Prijava'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}