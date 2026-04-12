import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4 absolute inset-0 z-50">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-xl shadow-xl">
        <div className="mb-8 text-center">
           <h1 className="text-3xl font-bold text-primary mb-2">NestEgg</h1>
           <p className="text-muted-foreground text-sm">Sign in to your account</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input type="email" placeholder="name@example.com" className="h-10 text-base py-2" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <Input type="password" placeholder="••••••••" className="h-10 text-base py-2" />
          </div>

          <Button className="w-full mt-6 h-10" variant="default">Sign In</Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">Create one</Link>
        </div>
      </div>
    </div>
  )
}
