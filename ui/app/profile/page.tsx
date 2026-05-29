"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { useAuth } from "@/components/auth/AuthProvider"
import { Bell, CreditCard, Shield, User } from "lucide-react"

export default function ProfilePage() {
  return (
    <RequireAuth fallbackTitle="Sign in to view your profile" fallbackDescription="Profile, security, and notification settings are protected behind authentication.">
      <ProfileContent />
    </RequireAuth>
  )
}

function ProfileContent() {
  const { user, permissions } = useAuth()

  return (
    <div className="min-h-full bg-background p-4 pb-24 md:p-8 md:pb-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Account Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your NestEgg profile, security, permissions, and preferences.</p>
          </div>
          <Link href="/subscription"><Button variant="outline" className="rounded-full"><CreditCard className="h-4 w-4" /> Manage plan</Button></Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 space-y-1">
            <button className="flex w-full items-center space-x-3 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors">
              <User className="h-4 w-4" /> <span>General</span>
            </button>
            <button className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <Shield className="h-4 w-4" /> <span>Security</span>
            </button>
            <button className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <Bell className="h-4 w-4" /> <span>Notifications</span>
            </button>
            <Link href="/subscription" className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <CreditCard className="h-4 w-4" /> <span>Subscription</span>
            </Link>
          </div>

          <div className="col-span-1 space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-medium text-foreground">General Information</h3>
                <Badge variant="secondary" className="rounded-full capitalize">{user?.role}</Badge>
                <Badge variant="outline" className="rounded-full capitalize">{user?.subscriptionTier}</Badge>
              </div>
              <p className="mb-6 mt-1 text-sm text-muted-foreground">Update your personal details here.</p>

              <form className="max-w-md space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="name">Full Name</label>
                  <Input id="name" defaultValue={user?.name ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="email">Email Address</label>
                  <Input id="email" defaultValue={user?.email ?? ""} disabled />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground" htmlFor="phone">Phone Number</label>
                  <Input id="phone" placeholder="+84 987 654 321" />
                </div>

                <div className="pt-4">
                  <Button variant="default" className="rounded-full">Save Changes</Button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-sm font-semibold text-foreground">Authorization scope</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {permissions.map((permission) => <Badge key={permission} variant="secondary" className="rounded-full">{permission}</Badge>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
