"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Bell, User, Bookmark, Settings } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      router.push("/?q=" + encodeURIComponent(searchQuery));
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 flex-col justify-center px-4 md:px-6">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl text-primary md:hidden mr-6">NestEgg</Link>
            
            {/* Quick Links for Desktop */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className={"transition-colors hover:text-primary " + (pathname === "/" ? "text-primary" : "text-muted-foreground")}>Screener</Link>
              <Link href="/watchlist" className={"transition-colors hover:text-primary " + (pathname === "/watchlist" ? "text-primary" : "text-muted-foreground")}>Watchlist</Link>
              <Link href="/profile" className={"transition-colors hover:text-primary " + (pathname === "/profile" ? "text-primary" : "text-muted-foreground")}>Profile</Link>
            </nav>
          </div>

          <div className="flex items-center flex-1 justify-end space-x-4">
            <div className="hidden md:flex relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search ticker (e.g., FPT)..."
                className="w-full bg-input rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary border-none shadow-sm transition-all"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/watchlist" className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-2">
                <Bookmark className="h-5 w-5" />
              </Link>
              
              {pathname === '/login' ? null : (
                <Link href="/login" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors md:border-l md:border-border md:pl-4 p-2">
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
