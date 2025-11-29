"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface Assignment {
  giftee_name: string
  giftee_id: string
}

interface AssignmentViewProps {
  roomCode: string
}

export function AssignmentView({ roomCode }: AssignmentViewProps) {
  const [revealed, setRevealed] = useState(false)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dare, setDare] = useState("")
  const [isSendingDare, setIsSendingDare] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAssignment()
  }, [roomCode])

  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomCode}/assignment`)
      if (!res.ok) throw new Error("Failed to fetch assignment")
      const data = await res.json()
      setAssignment(data.assignment)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendDare = async () => {
    if (!dare.trim()) {
      toast({
        title: "Empty dare",
        description: "Please write something before sending!",
        variant: "destructive",
      })
      return
    }

    setIsSendingDare(true)
    try {
      const res = await fetch(`/api/rooms/${roomCode}/dare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dare: dare.trim(), receiverId: assignment?.giftee_id }),
      })

      if (!res.ok) throw new Error("Failed to send dare")

      toast({
        title: "Dare sent! 🎉",
        description: `Your dare has been sent to ${assignment?.giftee_name.split(" ")[0]}!`,
      })
      setDare("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send dare. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingDare(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-accent/20">
        <p className="text-muted-foreground">Loading your assignment...</p>
      </Card>
    )
  }

  if (!assignment) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-accent/20">
        <p className="text-muted-foreground">No assignment found</p>
      </Card>
    )
  }

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-accent/20 shadow-xl">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-bold text-primary">Your Secret Santa Assignment</h2>
          <p className="text-muted-foreground">You've been assigned someone to gift. Keep it secret!</p>
        </div>

        {!revealed ? (
          <div className="py-12">
            <button
              onClick={() => setRevealed(true)}
              className="group relative px-12 py-6 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-semibold text-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <span className="relative z-10">🎁 Reveal Your Person 🎁</span>
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        ) : (
          <div className="py-8 space-y-4 animate-fade-in">
            <div className="text-6xl animate-bounce">🎅</div>
            <div className="space-y-2">
              <p className="text-lg text-muted-foreground">You're Secret Santa for:</p>
              <p className="font-serif text-4xl font-bold text-primary">{assignment.giftee_name}</p>
            </div>

            <Card className="p-6 bg-accent/10 border-accent/20 max-w-md mx-auto mt-8">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Remember to keep this a secret! Think about what would make {assignment.giftee_name.split(" ")[0]} happy
                and prepare a thoughtful gift. The joy is in the surprise! 🎄
              </p>
            </Card>

            {/* Dare Section */}
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20 max-w-2xl mx-auto mt-8 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                  🎯 Send a Dare
                </h3>
                <p className="text-sm text-muted-foreground">
                  Send a fun dare or challenge to {assignment.giftee_name.split(" ")[0]}! They'll see it in their dashboard.
                </p>
              </div>
              
              <div className="space-y-3">
                <Textarea
                  placeholder={`Write a fun dare for ${assignment.giftee_name.split(" ")[0]}...`}
                  value={dare}
                  onChange={(e) => setDare(e.target.value)}
                  className="min-h-24 resize-none"
                  disabled={isSendingDare}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {dare.length} characters
                  </span>
                  <Button 
                    onClick={handleSendDare} 
                    disabled={!dare.trim() || isSendingDare}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {isSendingDare ? "Sending..." : "Send Dare 🚀"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Card>
  )
}
