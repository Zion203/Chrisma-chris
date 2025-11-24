"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function Header() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" })
      if (res.ok) {
        router.push("/")
        router.refresh()
      } else {
        throw new Error("Sign out failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="border-b border-accent/10 bg-card/30 backdrop-blur-sm relative z-20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-serif text-2xl font-bold text-primary">
          Secret Santa
        </Link>

        <Button variant="ghost" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  )
}
