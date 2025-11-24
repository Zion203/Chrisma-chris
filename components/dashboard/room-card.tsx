"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Room {
  id: string
  name: string
  code: string
  participantCount: number
  isHost: boolean
  hasStarted: boolean
}

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Card className="p-6 bg-card/60 backdrop-blur-sm border-accent/10 hover:border-accent/30 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-semibold">{room.name}</h3>
            {room.isHost && (
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                Host
              </Badge>
            )}
            {room.hasStarted && <Badge className="bg-primary/20 text-primary">Started</Badge>}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-mono text-base font-semibold text-foreground">Code: {room.code}</span>
            <span>•</span>
            <span>{room.participantCount} participants</span>
          </div>
        </div>

        <Button asChild>
          <Link href={`/room/${room.code}`}>View Room</Link>
        </Button>
      </div>
    </Card>
  )
}
