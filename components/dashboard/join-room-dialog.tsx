"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface JoinRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoomJoined?: () => void
}

export function JoinRoomDialog({ open, onOpenChange, onRoomJoined }: JoinRoomDialogProps) {
  const [roomCode, setRoomCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleJoin = async () => {
    if (!roomCode.trim()) return

    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: roomCode.trim().toUpperCase() }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to join room")
      }

      const data = await res.json()
      console.log("Joined room data:", data)
      toast({
        title: "Joined Room!",
        description: `You've joined ${data.name}`,
      })
      onRoomJoined?.()
      onOpenChange(false)
      setRoomCode("")
      router.push(`/room/${data.code}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join room"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Join Room</DialogTitle>
          <DialogDescription>Enter the room code shared by your host to join the Secret Santa.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-code">Room Code</Label>
            <Input
              id="room-code"
              placeholder="e.g. ABC123"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value.toUpperCase())
                setError("")
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="uppercase font-mono text-lg tracking-wider"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleJoin} disabled={!roomCode.trim() || isLoading} className="flex-1">
            {isLoading ? "Joining..." : "Join Room"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
