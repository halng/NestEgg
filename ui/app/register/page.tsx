import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function RegisterPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4 absolute inset-0 z-50">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-xl shadow-xl">
        <div className="mb-8 text-center">
           <h1 className="text-3xl font-bold text-primary mb-2">NestEgg</h1>
           <p className="text-muted-foreground text-sm">Create a new account</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input type="text" placeholder="John Doe" className="h-10 text-base py-2" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input type="email" placeholder="name@example.com" className="h-10 text-base py-2" />
          </div>
          <div className="space-y-1.5">
             <label className="text-sm font-medium text-foreground">Password</label>
            <Input type="password" placeholder="••••••••" className="h-10 text-base py-2" />
          </div>

          <Button className="w-full mt-6 h-10" variant="default">Sign Up</Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </div>
      </div>
    </div>
  )
}
