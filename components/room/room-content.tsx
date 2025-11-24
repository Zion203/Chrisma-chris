"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ParticipantsList } from "./participants-list"
import { AssignmentView } from "./assignment-view"
import { ShareCodeDialog } from "./share-code-dialog"
import { useToast } from "@/hooks/use-toast"

interface Participant {
  id: string
  name: string
  email: string
  is_host: boolean
}

interface Room {
  id: string
  name: string
  code: string
  host_id: string
  status: string
  participants: Participant[]
}

interface RoomContentProps {
  code: string
}

export function RoomContent({ code }: RoomContentProps) {
  const [room, setRoom] = useState<Room | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRoomData()
    fetchCurrentUser()
  }, [code])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setCurrentUserId(data.user.id)
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error)
    }
  }

  const fetchRoomData = async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`)
      if (!res.ok) throw new Error("Room not found")
      const data = await res.json()
      setRoom(data.room)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load room. Please check the code and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartRoom = async () => {
    if (!room || !canStart) return

    setIsStarting(true)
    try {
      const res = await fetch(`/api/rooms/${room.code}/start`, {
        method: "POST",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to start room")
      }

      toast({
        title: "Secret Santa Started!",
        description: "Assignments have been generated and you've received an email copy.",
      })
      await fetchRoomData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start Secret Santa",
        variant: "destructive",
      })
    } finally {
      setIsStarting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-12 text-center bg-card/80 backdrop-blur-sm border-2 border-accent/20">
        <p className="text-muted-foreground">Loading room...</p>
      </Card>
    )
  }

  if (!room) {
    return (
      <Card className="p-12 text-center bg-card/80 backdrop-blur-sm border-2 border-accent/20">
        <p className="text-muted-foreground">Room not found</p>
      </Card>
    )
  }

  const isHost = room.host_id === currentUserId
  const canStart = room.participants.length >= 3 && room.status !== "started"

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="p-6 bg-card/80 backdrop-blur-sm border-2 border-accent/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-3xl font-bold text-primary">{room.name}</h1>
              {room.status === "started" && <Badge className="bg-primary/20 text-primary">Started</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Room Code:</span>
              <code className="font-mono text-xl font-bold text-foreground bg-accent/20 px-3 py-1 rounded">
                {room.code}
              </code>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setShowShareDialog(true)}>
              Share Code
            </Button>
            {isHost && room.status !== "started" && (
              <Button onClick={handleStartRoom} disabled={!canStart || isStarting} size="lg">
                {isStarting ? "Starting..." : "Start Secret Santa"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {room.status === "started" ? (
        <AssignmentView roomCode={room.code} />
      ) : (
        <>
          <ParticipantsList participants={room.participants} isHost={isHost} />

          {isHost && room.participants.length < 3 && (
            <Card className="p-6 bg-accent/10 border-accent/20">
              <p className="text-center text-muted-foreground">
                You need at least 3 participants to start the Secret Santa. Share the room code with others to invite
                them!
              </p>
            </Card>
          )}
        </>
      )}

      <ShareCodeDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        roomName={room.name}
        roomCode={room.code}
      />
    </div>
  )
}
