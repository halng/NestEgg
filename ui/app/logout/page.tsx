"use client"

import Link from "next/link"
import { useEffect } from "react"
import { CheckCircle2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/components/auth/AuthProvider"

export default function LogoutPage() {
  const { logout } = useAuth()

  useEffect(() => {
    logout()
  }, [logout])

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-foreground">You have been logged out</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Your local NestEgg session has been cleared from this browser.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login"><Button className="rounded-full"><LogIn className="h-4 w-4" /> Sign back in</Button></Link>
          <Link href="/"><Button variant="outline" className="rounded-full">Go to screener</Button></Link>
        </div>
      </div>
    </div>
  )
}
