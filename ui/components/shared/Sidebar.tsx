"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BarChart2, Bookmark, CreditCard, LogOut, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/AuthProvider"

export function Sidebar() {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()

  const links = [
    { href: "/", icon: Activity, label: "Screener" },
    { href: "/watchlist", icon: Bookmark, label: "Watchlist" },
    { href: "/subscription", icon: CreditCard, label: "Subscription" },
    { href: "/profile", icon: Settings, label: "Profile" },
  ]

  return (
    <div className="sticky top-0 z-50 hidden h-screen w-14 shrink-0 flex-col border-r border-border bg-card transition-all duration-300 hover:w-48 md:flex group">
      <div className="flex h-12 items-center justify-center border-b border-border transition-all group-hover:justify-start group-hover:px-4">
        <BarChart2 className="h-6 w-6 shrink-0 text-primary" />
        <span className="ml-2 overflow-hidden whitespace-nowrap font-bold text-lg text-primary opacity-0 transition-opacity group-hover:opacity-100 md:text-xl">VN Screen</span>
      </div>

      <div className="relative flex flex-1 flex-col gap-2 py-4">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "mx-2 flex items-center justify-center rounded-md py-2 transition-colors group-hover:justify-start group-hover:px-2",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="ml-3 truncate text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
                {link.label}
              </span>
            </Link>
          )
        })}

        <div className="mb-4 mt-auto">
          <Link
            href={isAuthenticated ? "/logout" : "/login"}
            onClick={() => {
              if (isAuthenticated) logout()
            }}
            className="mx-2 flex items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger group-hover:justify-start group-hover:px-2"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="ml-3 truncate text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
              {isAuthenticated ? "Log Out" : "Sign In"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
