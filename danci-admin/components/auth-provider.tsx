"use client"

import * as React from "react"

import {
  getCurrentUser,
  setCurrentUser,
  signin as signinAction,
  signup as signupAction,
  type AdminUser,
} from "@/lib/auth"

type AuthContextValue = {
  user: AdminUser | null
  loading: boolean
  signup: (input: {
    name: string
    email: string
    password: string
  }) => { ok: boolean; error?: string }
  signin: (input: {
    email: string
    password: string
  }) => { ok: boolean; error?: string }
  signout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AdminUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setUser(getCurrentUser())
    setLoading(false)
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signup(input) {
        const res = signupAction(input)
        if (res.ok) return { ok: true }
        return { ok: false, error: res.error }
      },
      signin(input) {
        const res = signinAction(input)
        if (res.ok) {
          setUser(res.data)
          setCurrentUser(res.data)
          return { ok: true }
        }
        return { ok: false, error: res.error }
      },
      signout() {
        setUser(null)
        setCurrentUser(null)
      },
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}