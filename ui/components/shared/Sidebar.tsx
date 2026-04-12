"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BarChart2, Bookmark, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/", icon: Activity, label: "Screener" },
    { href: "/watchlist", icon: Bookmark, label: "Watchlist" },
    { href: "/profile", icon: Settings, label: "Profile" },
  ]

  return (
    <div className="hidden md:flex flex-col w-14 shrink-0 hover:w-48 group transition-all duration-300 border-r border-border bg-card h-screen sticky top-0 z-50">
      <div className="flex h-12 items-center justify-center group-hover:justify-start group-hover:px-4 border-b border-border transition-all">
        <BarChart2 className="h-6 w-6 text-primary shrink-0" />
        <span className="font-bold text-lg md:text-xl text-primary ml-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">VN Screen</span>
      </div>
      
      <div className="flex-1 py-4 flex flex-col gap-2 relative">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "mx-2 flex items-center justify-center group-hover:justify-start group-hover:px-2 py-2 rounded-md transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="ml-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {link.label}
              </span>
            </Link>
          )
        })}

        <div className="mt-auto mb-4">
          <Link
            href="/login"
            className="mx-2 flex items-center justify-center group-hover:justify-start group-hover:px-2 py-2 rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="ml-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate">
              Log Out
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
