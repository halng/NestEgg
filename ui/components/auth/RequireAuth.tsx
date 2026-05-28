"use client"

import type * as React from "react"
import Link from "next/link"
import { LockKeyhole, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Permission } from "@/lib/auth"
import { useAuth } from "@/components/auth/AuthProvider"

interface RequireAuthProps {
  children: React.ReactNode
  permission?: Permission
  fallbackTitle?: string
  fallbackDescription?: string
}

export function RequireAuth({ children, permission, fallbackTitle, fallbackDescription }: RequireAuthProps) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth()

  if (isLoading) {
    return <div className="m-6 h-96 animate-pulse rounded-3xl border border-border bg-card" />
  }

  if (!isAuthenticated) {
    return (
      <AuthStateCard
        icon="lock"
        title={fallbackTitle ?? "Sign in required"}
        description={fallbackDescription ?? "Create an account or sign in to access protected portfolio tools."}
        actionLabel="Sign in"
        actionHref="/login"
      />
    )
  }

  if (permission && !hasPermission(permission)) {
    return (
      <AuthStateCard
        icon="shield"
        title="Upgrade required"
        description="Your current role or subscription does not include this feature. Upgrade to Pro Analyst to unlock it."
        actionLabel="View subscription"
        actionHref="/subscription"
      />
    )
  }

  return <>{children}</>
}

function AuthStateCard({ icon, title, description, actionLabel, actionHref }: { icon: "lock" | "shield"; title: string; description: string; actionLabel: string; actionHref: string }) {
  const Icon = icon === "lock" ? LockKeyhole : ShieldAlert

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-foreground">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        <Link href={actionHref}>
          <Button className="mt-6 rounded-full px-8">{actionLabel}</Button>
        </Link>
      </div>
    </div>
  )
}
