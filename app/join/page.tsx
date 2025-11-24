"use client"

import { useState } from "react"
import { Snowfall } from "@/components/snowfall"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function JoinPage() {
  const [roomCode, setRoomCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleJoin = async () => {
    if (!roomCode.trim()) return

    setIsLoading(true)
    setError("")
    try {
      console.log("[v0] Checking room:", roomCode)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push(`/auth/signin?returnTo=/room/${roomCode.toUpperCase()}`)
    } catch (error) {
      console.error("[v0] Error checking room:", error)
      setError("Room not found. Please check the code and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden flex items-center justify-center">
      <Snowfall />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary">Secret Santa</h1>
            </Link>
            <p className="text-muted-foreground">Join a Secret Santa room</p>
          </div>

          <Card className="p-8 bg-card/80 backdrop-blur-sm border-2 border-accent/20 shadow-2xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="room-code" className="text-base">
                  Room Code
                </Label>
                <Input
                  id="room-code"
                  placeholder="e.g. ABC123"
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase())
                    setError("")
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  className="uppercase font-mono text-2xl tracking-wider text-center h-14"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <Button
                onClick={handleJoin}
                disabled={!roomCode.trim() || isLoading}
                size="lg"
                className="w-full text-base"
              >
                {isLoading ? "Checking..." : "Join Room"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You'll need to sign in with Google to join a room
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
