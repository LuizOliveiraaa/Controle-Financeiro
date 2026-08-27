import React, { createContext, useContext, useState, useEffect } from 'react'
import api, { setAccessToken } from '../services/api'

type User = { id: string; email: string; nome?: string } | null

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // try to fetch current user if cookie refresh exists
    (async () => {
      try {
        const res = await api.post('/auth/refresh')
        const token = res.data.access_token
        setAccessToken(token)
        const me = await api.get('/auth/me')
        setUser(me.data.user)
      } catch (e) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const token = res.data.access_token
    setAccessToken(token)
    setUser(res.data.user)
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setAccessToken(null)
    setUser(null)
  }

  const value = { user, loading, login, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
