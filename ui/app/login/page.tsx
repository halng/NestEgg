"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { ShieldCheck, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/components/auth/AuthProvider"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("hal@nestegg.vn")
  const [password, setPassword] = useState("demo-password")
  const [error, setError] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || !password) {
      setError("Email and password are required.")
      return
    }
    login(email, password)
    const nextPath = new URLSearchParams(window.location.search).get("next") || "/"
    router.push(nextPath)
  }

  return (
    <div className="absolute inset-0 z-50 flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.2),transparent_30rem),var(--background)] p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl shadow-black/30 md:grid-cols-[1fr_440px]">
        <div className="hidden flex-col justify-between bg-primary/10 p-8 md:flex">
          <div>
            <Link href="/" className="text-2xl font-black text-primary">NestEgg</Link>
            <h1 className="mt-10 max-w-md text-4xl font-black tracking-tight text-foreground">Authenticated access for serious market work.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Sign in to unlock authorized watchlists, alert management, billing controls, and AI-powered screens based on your role and plan.</p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><ShieldCheck className="h-4 w-4 text-primary" /> Role-based authorization</div>
              <p className="mt-2 text-xs text-muted-foreground">Demo analyst: hal@nestegg.vn · Demo admin: admin@nestegg.vn</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Sparkles className="h-4 w-4 text-primary" /> Subscription aware</div>
              <p className="mt-2 text-xs text-muted-foreground">Features respond to Free, Pro Analyst, and Desk plans.</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-foreground">Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">Use a demo account or any email to create a local Starter session.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="h-10 py-2 text-base" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" className="h-10 py-2 text-base" />
            </div>

            {error ? <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}

            <Button className="mt-6 h-10 w-full rounded-full" variant="default" type="submit">Sign In</Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
