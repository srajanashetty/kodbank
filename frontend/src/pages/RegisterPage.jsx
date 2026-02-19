import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || ''

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    uid: '',
    uname: '',
    password: '',
    email: '',
    phone: '',
    role: 'Customer',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.uid || !form.uname || !form.password || !form.email || !form.phone) {
      setError('All fields are required.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed')
      }
      setSuccess('Registered successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Create your KodBank account</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          UID
          <input
            name="uid"
            value={form.uid}
            onChange={handleChange}
            placeholder="Enter unique ID"
          />
        </label>
        <label>
          Username
          <input
            name="uname"
            value={form.uname}
            onChange={handleChange}
            placeholder="Choose a username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Choose a password"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Phone
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone number"
          />
        </label>
        <label>
          Role
          <select name="role" value={form.role} disabled>
            <option value="Customer">Customer</option>
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default RegisterPage

