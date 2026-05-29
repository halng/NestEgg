"use client"
import type * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bookmark, Crown, LogOut, Search, User } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      router.push("/?q=" + encodeURIComponent(searchQuery))
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/logout")
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 flex-col justify-center px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-6 font-bold text-xl text-primary md:hidden">NestEgg</Link>

            <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
              <Link href="/" className={"transition-colors hover:text-primary " + (pathname === "/" ? "text-primary" : "text-muted-foreground")}>Screener</Link>
              <Link href="/watchlist" className={"transition-colors hover:text-primary " + (pathname === "/watchlist" ? "text-primary" : "text-muted-foreground")}>Watchlist</Link>
              <Link href="/subscription" className={"transition-colors hover:text-primary " + (pathname === "/subscription" ? "text-primary" : "text-muted-foreground")}>Subscription</Link>
              <Link href="/profile" className={"transition-colors hover:text-primary " + (pathname === "/profile" ? "text-primary" : "text-muted-foreground")}>Profile</Link>
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <div className="relative hidden w-72 md:flex">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search ticker (e.g., FPT)..."
                className="w-full rounded-full border-none bg-input py-2 pl-10 pr-4 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/watchlist" className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden">
                <Bookmark className="h-5 w-5" />
              </Link>

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 md:border-l md:border-border md:pl-4">
                  <Link href="/subscription" className="hidden items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:flex">
                    <Crown className="h-3.5 w-3.5" /> {user.subscriptionTier.toUpperCase()}
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground">
                    <User className="h-4 w-4" />
                    <span className="hidden max-w-24 truncate sm:inline">{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger" aria-label="Log out">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : pathname === "/login" ? null : (
                <Link href="/login" className="flex items-center space-x-1 p-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:border-l md:border-border md:pl-4">
                  <User className="h-5 w-5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
