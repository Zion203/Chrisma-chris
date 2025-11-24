"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreateRoomDialog } from "./create-room-dialog"
import { JoinRoomDialog } from "./join-room-dialog"
import { RoomCard } from "./room-card"
import { useToast } from "@/hooks/use-toast"

interface Room {
  id: string
  name: string
  code: string
  participant_count: number
  is_host: boolean
  has_started: boolean
}

export function DashboardContent() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAssignedRooms()
  }, [])

  const fetchAssignedRooms = async () => {
    try {
      const res = await fetch("/api/rooms/assigned")
      if (!res.ok) throw new Error("Failed to fetch assigned rooms")
      const data = await res.json()
      // API returns { assignments: [{ room: {...} }]} so extract rooms
      console.log("Assigned rooms data:", data)
      const assignedRooms = data.rooms 
      setRooms(assignedRooms)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your assigned rooms. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoomCreated = () => {
    fetchAssignedRooms()
  }

  const handleRoomJoined = () => {
    fetchAssignedRooms()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary">Your Secret Santa Rooms</h1>
        <p className="text-muted-foreground text-lg">Create a new room or join an existing one</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="text-base px-8" onClick={() => setShowCreateDialog(true)}>
          Create New Room
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="text-base px-8 border-2 bg-transparent"
          onClick={() => setShowJoinDialog(true)}
        >
          Join Room
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Rooms</h2>
        {isLoading ? (
          <Card className="p-12 text-center bg-card/60 backdrop-blur-sm border-accent/10">
            <p className="text-muted-foreground">Loading your rooms...</p>
          </Card>
        ) : rooms.length === 0 ? (
          <Card className="p-12 text-center bg-card/60 backdrop-blur-sm border-accent/10">
            <p className="text-muted-foreground">You haven't joined any rooms yet. Create one or join with a code!</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={{
                  id: room.id,
                  name: room.name,
                  code: room.code,
                  participantCount: room.participant_count,
                  isHost: room.is_host,
                  hasStarted: room.has_started,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <CreateRoomDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onRoomCreated={handleRoomCreated} />
      <JoinRoomDialog open={showJoinDialog} onOpenChange={setShowJoinDialog} onRoomJoined={handleRoomJoined} />
    </div>
  )
}
