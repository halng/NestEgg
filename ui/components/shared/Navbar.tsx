"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, User } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-12 flex-col justify-center px-4 md:px-6">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center md:hidden">
            <Link href="/" className="font-bold text-lg text-primary mr-6">NestEgg</Link>
          </div>

          <div className="flex items-center flex-1 justify-end md:justify-between">
            <div className="hidden md:flex flex-1 items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search ticker (e.g., FPT)..."
                  className="w-full bg-input rounded-md pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary border-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              
              {pathname === '/login' ? null : (
                <Link href="/login" className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ml-2 border-l border-border pl-3">
                  <User className="h-4 w-4" />
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
