"use client"

import { Check, Crown, ShieldCheck, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { useAuth } from "@/components/auth/AuthProvider"
import { canUsePlan, subscriptionPlans } from "@/lib/auth"

const planIcons = {
  free: Sparkles,
  pro: Crown,
  enterprise: Users,
}

export default function SubscriptionPage() {
  return (
    <RequireAuth fallbackTitle="Sign in to manage subscription" fallbackDescription="Subscription, billing, and authorization controls are available after authentication.">
      <SubscriptionContent />
    </RequireAuth>
  )
}

function SubscriptionContent() {
  const { user, permissions, upgradePlan, hasPermission } = useAuth()
  const currentTier = user?.subscriptionTier ?? "free"

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_30rem),var(--background)] p-4 pb-24 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-2xl shadow-black/20 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-primary">Subscription & Authorization</Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-foreground md:text-5xl">Control access to premium stock intelligence.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">Plans unlock capabilities while roles define what each user can do. This mock implementation stores the current account locally so flows can be tested without a backend.</p>
            </div>
            <div className="rounded-3xl border border-border bg-background/70 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="font-bold text-foreground">{user?.name}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-card p-3"><p className="text-xs text-muted-foreground">Role</p><p className="mt-1 font-semibold capitalize text-foreground">{user?.role}</p></div>
                <div className="rounded-2xl bg-card p-3"><p className="text-xs text-muted-foreground">Plan</p><p className="mt-1 font-semibold capitalize text-primary">{currentTier}</p></div>
              </div>
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active permissions</p>
                <div className="flex flex-wrap gap-2">
                  {permissions.map((permission) => <Badge key={permission} variant="secondary" className="rounded-full">{permission}</Badge>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {subscriptionPlans.map((plan) => {
            const Icon = planIcons[plan.id]
            const isCurrent = plan.id === currentTier
            const isIncluded = canUsePlan(currentTier, plan.id)
            return (
              <article key={plan.id} className={"flex flex-col rounded-3xl border bg-card p-5 shadow-xl shadow-black/10 " + (isCurrent ? "border-primary ring-1 ring-primary/40" : "border-border")}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div>
                  <Badge variant={isCurrent ? "success" : "outline"} className="rounded-full">{isCurrent ? "Current" : plan.badge}</Badge>
                </div>
                <h2 className="mt-5 text-2xl font-black text-foreground">{plan.name}</h2>
                <p className="mt-1 text-3xl font-black text-primary">{plan.price}</p>
                <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                <div className="my-5 h-px bg-border" />
                <ul className="grid flex-1 gap-3 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {feature}</li>
                  ))}
                </ul>
                <Button className="mt-6 rounded-full" variant={isCurrent ? "secondary" : "default"} disabled={isCurrent} onClick={() => upgradePlan(plan.id)}>
                  {isCurrent ? "Active plan" : isIncluded ? "Switch plan" : "Upgrade"}
                </Button>
              </article>
            )
          })}
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Authorization checks</h2>
              <p className="mt-1 text-sm text-muted-foreground">Feature access is computed from the active role and subscription tier.</p>
            </div>
            <Badge variant={hasPermission("adminUsers") ? "success" : "outline"} className="rounded-full">
              {hasPermission("adminUsers") ? "Admin access enabled" : "Admin access locked"}
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <PermissionCard label="AI screens" enabled={hasPermission("useAiScreens")} />
            <PermissionCard label="Alert management" enabled={hasPermission("manageAlerts")} />
            <PermissionCard label="Billing controls" enabled={hasPermission("manageBilling")} />
          </div>
        </section>
      </div>
    </div>
  )
}

function PermissionCard({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className={enabled ? "mt-2 text-sm text-success" : "mt-2 text-sm text-muted-foreground"}>{enabled ? "Authorized" : "Requires upgrade"}</p>
    </div>
  )
}
