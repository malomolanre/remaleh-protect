import { useState } from 'react'
import { API } from '../lib/api'

export function useBreachCheck() {
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState(null)

  const check = async (email) => {
    if (!email || !email.trim()) return null
    setIsChecking(true)
    setResult(null)
    try {
      const response = await fetch(`${API}/api/breach/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setResult(data)
      return data
    } catch (e) {
      setResult({ error: true, message: 'Unable to check breaches at this time.' })
      return null
    } finally {
      setIsChecking(false)
    }
  }

  return { isChecking, result, check }
}
