import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Participant {
  id: string
  name: string
  email: string
  isHost: boolean
}

interface ParticipantsListProps {
  participants: Participant[]
  isHost: boolean
}

export function ParticipantsList({ participants, isHost }: ParticipantsListProps) {
  return (
    <Card className="p-6 bg-card/60 backdrop-blur-sm border-accent/10">
      <h2 className="text-2xl font-semibold mb-4">Participants ({participants.length})</h2>

      <div className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-4 bg-accent/5 rounded-lg border border-accent/10"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{participant.name}</span>
                {participant.isHost && (
                  <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-xs">
                    Host
                  </Badge>
                )}
              </div>
              {isHost && <span className="text-sm text-muted-foreground">{participant.email}</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
