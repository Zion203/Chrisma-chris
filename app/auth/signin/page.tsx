import { SignInForm } from "@/components/auth/sign-in-form"
import { Snowfall } from "@/components/snowfall"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden flex items-center justify-center">
      <Snowfall />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary">Secret Santa</h1>
            </Link>
            <p className="text-muted-foreground">Sign in to start spreading joy</p>
          </div>

          <SignInForm />
        </div>
      </div>
    </div>
  )
}
