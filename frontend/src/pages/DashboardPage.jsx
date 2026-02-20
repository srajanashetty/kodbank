import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'

// Use relative URL when possible (Vite proxy) for reliable cookie handling
const API_BASE = import.meta.env.VITE_API_URL || ''

function DashboardPage() {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Clear stale balance when page is restored from back/forward cache
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        setBalance(null)
        setShowConfetti(false)
        setError('')
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  useEffect(() => {
    // CRITICAL: Always clear balance on mount to prevent showing stale data
    setBalance(null)
    setShowConfetti(false)
    setError('')
    setIsAuthenticated(false) // Reset auth state on mount
    
    async function verifyAuth() {
      try {
        const res = await fetch(`${API_BASE}/api/user/balance`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store', // Prevent browser from caching balance response
        })
        
        if (res.status === 401) {
          // Not authenticated - clear everything and redirect immediately
          setBalance(null)
          setShowConfetti(false)
          setError('')
          setIsAuthenticated(false)
          navigate('/login', { replace: true })
          return // Don't set authChecked - we're redirecting
        }
        
        // If 200, user is authenticated but we don't pre-load balance
        // Balance will only show when user clicks "Check Balance"
        if (res.status === 200) {
          setIsAuthenticated(true)
        }
      } catch (err) {
        // Any error means not authenticated
        setBalance(null)
        setShowConfetti(false)
        setError('')
        setIsAuthenticated(false)
        navigate('/login', { replace: true })
        return // Don't set authChecked - we're redirecting
      }
      setAuthChecked(true) // Only set when user is authenticated
    }
    verifyAuth()
  }, [navigate])

  async function handleLogout() {
    // Clear balance immediately (before API call)
    setBalance(null)
    setShowConfetti(false)
    setError('')
    setIsAuthenticated(false) // Mark as not authenticated
    
    try {
      // Wait for logout API to complete - ensures cookie is cleared
      const res = await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      })
      
      if (!res.ok) {
        console.error('Logout failed:', res.status)
      }
      
      // Ensure balance is cleared again after logout
      setBalance(null)
      setShowConfetti(false)
      setError('')
      setIsAuthenticated(false)
      
      // Navigate to login - cookie clearing happens via response headers
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
      // Even on error, clear balance and navigate
      setBalance(null)
      setShowConfetti(false)
      setError('')
      setIsAuthenticated(false)
      navigate('/login', { replace: true })
    }
  }

  async function handleCheckBalance() {
    // ALWAYS clear any previous balance and errors before making request
    setBalance(null)
    setError('')
    setShowConfetti(false)
    setLoading(true)
    
    try {
      const res = await fetch(`${API_BASE}/api/user/balance`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store', // Prevent browser from caching balance response
      })
      
      // CRITICAL: Handle unauthorized FIRST - before parsing JSON
      if (res.status === 401) {
        // User is not authenticated - clear everything and redirect
        setBalance(null)
        setShowConfetti(false)
        setIsAuthenticated(false)
        setError('Unauthorized: Please login to check balance.')
        // Force redirect to login immediately
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 100)
        return
      }
      
      // Parse JSON safely - handle empty or invalid response
      const text = await res.text()
      let data = {}
      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          setError('Server returned an invalid response. Is the backend running?')
          return
        }
      }
      
      // Double-check: if response is not OK, don't show balance
      if (!res.ok || res.status !== 200) {
        setBalance(null)
        setShowConfetti(false)
        setIsAuthenticated(false)
        setError(data.message || 'Failed to fetch balance')
        if (res.status === 401) {
          navigate('/login', { replace: true })
        }
        return
      }
      
      // ONLY set balance if we got a successful 200 response with valid data
      // The 200 status means we're authenticated (backend verified token)
      if (res.status === 200 && data && data.balance !== undefined && data.balance !== null) {
        setIsAuthenticated(true) // Mark as authenticated since we got 200
        setBalance(data.balance)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      } else {
        // Invalid response - don't show balance
        setBalance(null)
        setShowConfetti(false)
        setIsAuthenticated(false)
        setError('Invalid response from server')
      }
    } catch (err) {
      // On ANY error (network, JSON parse, etc.), ensure balance is cleared
      setBalance(null)
      setShowConfetti(false)
      
      // Check if it's an unauthorized error
      if (err.message && (err.message.includes('Unauthorized') || err.message.includes('401'))) {
        setError('Unauthorized: Please login to check balance.')
        navigate('/login', { replace: true })
      } else {
        // Other errors - don't show balance
        setError(err.message || 'Failed to fetch balance. Please login and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!authChecked) {
    return (
      <div className="dashboard">
        <p>Verifying...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
      <div className="card">
        <h2>Welcome to your dashboard</h2>
        <button onClick={handleCheckBalance} disabled={loading}>
          {loading ? 'Checking...' : 'Check balance'}
        </button>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
        {error && <p className="error">{error}</p>}
        {/* CRITICAL: Only show balance if authenticated AND balance is set */}
        {isAuthenticated && balance !== null && (
          <p className="balance-message">
            your balance is : <span className="balance-value">{balance}</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default DashboardPage

