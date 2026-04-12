import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { User, Shield, CreditCard, Bell } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-8 bg-background min-h-full pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your NestEgg profile and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Nav for Profile */}
          <div className="col-span-1 space-y-1">
            <button className="w-full flex items-center space-x-3 px-3 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium transition-colors">
               <User className="w-4 h-4" /> <span>General</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors">
               <Shield className="w-4 h-4" /> <span>Security</span>
            </button>
             <button className="w-full flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors">
               <Bell className="w-4 h-4" /> <span>Notifications</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors">
               <CreditCard className="w-4 h-4" /> <span>Subscription</span>
            </button>
          </div>
          
          {/* Main Form */}
          <div className="col-span-1 md:col-span-3 space-y-6 bg-card border border-border p-6 rounded-xl shadow-sm">
             <div>
                <h3 className="text-lg font-medium text-foreground">General Information</h3>
                <p className="text-sm text-muted-foreground mb-6">Update your personal details here.</p>
                
                <form className="space-y-4 max-w-md">
                   <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <Input defaultValue="Hal" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Email Address</label>
                      <Input defaultValue="hal@example.com" disabled />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Phone Number</label>
                      <Input placeholder="+84 987 654 321" />
                   </div>
                   
                   <div className="pt-4">
                     <Button variant="default">Save Changes</Button>
                   </div>
                </form>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
