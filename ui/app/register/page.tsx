"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/components/auth/AuthProvider"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState("New Investor")
  const [email, setEmail] = useState("investor@example.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name || !email || password.length < 8) {
      setError("Enter your name, email, and a password with at least 8 characters.")
      return
    }
    register(name, email, password)
    router.push("/subscription")
  }

  return (
    <div className="absolute inset-0 z-50 flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-2 block text-3xl font-bold text-primary">NestEgg</Link>
          <p className="text-sm text-muted-foreground">Create an account and start on the Starter plan.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="name">Name</label>
            <Input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" className="h-10 py-2 text-base" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="h-10 py-2 text-base" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="h-10 py-2 text-base" />
          </div>

          {error ? <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}

          <Button className="mt-6 h-10 w-full rounded-full" variant="default" type="submit">Sign Up</Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  )
}
