"use client"

import * as React from "react"
import { AuthUser, Permission, SubscriptionTier, demoUsers, hasPermission as canUser, permissionsForUser } from "@/lib/auth"

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  permissions: Permission[]
  login: (email: string, password: string) => AuthUser
  register: (name: string, email: string, password: string) => AuthUser
  logout: () => void
  upgradePlan: (tier: SubscriptionTier) => void
  hasPermission: (permission: Permission) => boolean
}

const STORAGE_KEY = "nestegg-auth-user"

const defaultContext: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  permissions: ["viewScreener"],
  login: () => demoUsers[0],
  register: (name, email) => ({ id: `local-${Date.now()}`, name, email, role: "viewer", subscriptionTier: "free" }),
  logout: () => undefined,
  upgradePlan: () => undefined,
  hasPermission: (permission) => permission === "viewScreener",
}

const AuthContext = React.createContext<AuthContextValue>(defaultContext)

function persistUser(user: AuthUser | null) {
  if (typeof window === "undefined") return
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => readUser())
  const isLoading = false

  const commitUser = React.useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser)
    persistUser(nextUser)
  }, [])

  const login = React.useCallback((email: string, password: string) => {
    void password
    const normalizedEmail = email.trim().toLowerCase()
    const matchedUser = demoUsers.find((demoUser) => demoUser.email.toLowerCase() === normalizedEmail)
    const nextUser = matchedUser ?? {
      id: `local-${normalizedEmail || "demo"}`,
      name: normalizedEmail.split("@")[0] || "NestEgg User",
      email: normalizedEmail || demoUsers[0].email,
      role: "viewer" as const,
      subscriptionTier: "free" as const,
    }
    commitUser(nextUser)
    return nextUser
  }, [commitUser])

  const register = React.useCallback((name: string, email: string, password: string) => {
    void password
    const nextUser: AuthUser = {
      id: `local-${Date.now()}`,
      name: name.trim() || "NestEgg User",
      email: email.trim().toLowerCase(),
      role: "viewer",
      subscriptionTier: "free",
    }
    commitUser(nextUser)
    return nextUser
  }, [commitUser])

  const logout = React.useCallback(() => commitUser(null), [commitUser])

  const upgradePlan = React.useCallback((tier: SubscriptionTier) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser
      const nextUser: AuthUser = {
        ...currentUser,
        subscriptionTier: tier,
        role: tier === "enterprise" ? "admin" : tier === "pro" ? "analyst" : "viewer",
      }
      persistUser(nextUser)
      return nextUser
    })
  }, [])

  const permissions = React.useMemo(() => permissionsForUser(user), [user])

  const value = React.useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    permissions,
    login,
    register,
    logout,
    upgradePlan,
    hasPermission: (permission) => canUser(user, permission),
  }), [isLoading, login, logout, permissions, register, upgradePlan, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return React.useContext(AuthContext)
}
