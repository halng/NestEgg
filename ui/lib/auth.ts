export type SubscriptionTier = "free" | "pro" | "enterprise"
export type UserRole = "viewer" | "analyst" | "admin"
export type Permission = "viewScreener" | "viewWatchlist" | "manageAlerts" | "useAdvancedFilters" | "useAiScreens" | "manageBilling" | "adminUsers"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  subscriptionTier: SubscriptionTier
}

export interface SubscriptionPlan {
  id: SubscriptionTier
  name: string
  price: string
  description: string
  badge: string
  features: string[]
  permissions: Permission[]
}

export const demoUsers: AuthUser[] = [
  {
    id: "demo-analyst",
    name: "Hal Nguyen",
    email: "hal@nestegg.vn",
    role: "analyst",
    subscriptionTier: "pro",
  },
  {
    id: "demo-admin",
    name: "Admin User",
    email: "admin@nestegg.vn",
    role: "admin",
    subscriptionTier: "enterprise",
  },
]

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Starter",
    price: "Free",
    description: "Track the market with essential screens and a personal watchlist.",
    badge: "For casual investors",
    permissions: ["viewScreener", "viewWatchlist"],
    features: ["Delayed screener data", "One watchlist", "Basic valuation filters", "Community support"],
  },
  {
    id: "pro",
    name: "Pro Analyst",
    price: "249K VND/mo",
    description: "Unlock AI screens, alerts, advanced filters, and compare workflows.",
    badge: "Most popular",
    permissions: ["viewScreener", "viewWatchlist", "manageAlerts", "useAdvancedFilters", "useAiScreens", "manageBilling"],
    features: ["Real-time market pulse", "AI strategy builder", "Unlimited alerts", "Advanced factor filters", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Desk",
    price: "Custom",
    description: "Team workspaces, admin controls, and institutional-grade permissions.",
    badge: "For teams",
    permissions: ["viewScreener", "viewWatchlist", "manageAlerts", "useAdvancedFilters", "useAiScreens", "manageBilling", "adminUsers"],
    features: ["Everything in Pro", "Role-based authorization", "Team billing", "Audit-ready access logs", "Dedicated onboarding"],
  },
]

export const rolePermissions: Record<UserRole, Permission[]> = {
  viewer: ["viewScreener", "viewWatchlist"],
  analyst: ["viewScreener", "viewWatchlist", "manageAlerts", "useAdvancedFilters", "useAiScreens", "manageBilling"],
  admin: ["viewScreener", "viewWatchlist", "manageAlerts", "useAdvancedFilters", "useAiScreens", "manageBilling", "adminUsers"],
}

export const tierRank: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
}

export function planForTier(tier: SubscriptionTier) {
  return subscriptionPlans.find((plan) => plan.id === tier) ?? subscriptionPlans[0]
}

export function permissionsForUser(user: AuthUser | null): Permission[] {
  if (!user) return ["viewScreener"]

  const planPermissions = planForTier(user.subscriptionTier).permissions
  const permissions = new Set<Permission>([...rolePermissions[user.role], ...planPermissions])
  return Array.from(permissions)
}

export function hasPermission(user: AuthUser | null, permission: Permission) {
  return permissionsForUser(user).includes(permission)
}

export function canUsePlan(currentTier: SubscriptionTier, targetTier: SubscriptionTier) {
  return tierRank[currentTier] >= tierRank[targetTier]
}
