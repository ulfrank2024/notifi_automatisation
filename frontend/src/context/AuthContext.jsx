import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const TOKEN_KEY = 'nf_token'
const EMAIL_KEY = 'nf_email'

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY))
  const [email, setEmail]   = useState(() => localStorage.getItem(EMAIL_KEY))
  const [ready, setReady]   = useState(false)

  // Injecter le token dans tous les appels axios
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const t = localStorage.getItem(TOKEN_KEY)
      if (t) config.headers.Authorization = `Bearer ${t}`
      return config
    })
    return () => axios.interceptors.request.eject(interceptor)
  }, [])

  // Intercepteur réponse : déconnexion auto si 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) logout()
        return Promise.reject(err)
      }
    )
    return () => axios.interceptors.response.eject(interceptor)
  }, [])

  // Vérification du token au démarrage
  useEffect(() => {
    if (!token) { setReady(true); return }
    axios.get('/api/auth/me')
      .then(() => setReady(true))
      .catch(() => { logout(); setReady(true) })
  }, [])

  function login(accessToken, userEmail) {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(EMAIL_KEY, userEmail)
    setToken(accessToken)
    setEmail(userEmail)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    setToken(null)
    setEmail(null)
  }

  return (
    <AuthContext.Provider value={{ token, email, ready, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
