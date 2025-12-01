"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface Dare {
  id: string
  dare_text: string
  is_read: boolean
  created_at: string
  sender_name: string
  sender_avatar: string | null
  room_name: string
  room_code: string
}

export function DaresView() {
  const [dares, setDares] = useState<Dare[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDares()
  }, [])

  const fetchDares = async () => {
    try {
      const res = await fetch("/api/dares")
      if (!res.ok) throw new Error("Failed to fetch dares")
      const data = await res.json()
      setDares(data.dares)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dares. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (dareId: string) => {
    try {
      const res = await fetch("/api/dares", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dareId }),
      })

      if (!res.ok) throw new Error("Failed to mark dare as read")

      // Update local state
      setDares((prev) =>
        prev.map((dare) => (dare.id === dareId ? { ...dare, is_read: true } : dare))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark dare as read.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <Card className="p-12 text-center bg-card/60 backdrop-blur-sm border-accent/10">
        <p className="text-muted-foreground">Loading your dares...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          🎯 Your Dares
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-6 min-w-6 rounded-full px-2">
              {unreadCount}
            </Badge>
          )}
        </h2>
      </div>

      {dares.length === 0 ? (
        <Card className="p-12 text-center bg-card/60 backdrop-blur-sm border-accent/10">
          <p className="text-muted-foreground">
            No dares yet! Your Secret Santa will send you fun challenges soon. 🎄
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {dares.map((dare) => (
            <Card
              key={dare.id}
              className={`p-6 transition-all hover:shadow-lg ${
                !dare.is_read
                  ? "bg-gradient-to-br from-accent/20 to-primary/10 border-accent/30 border-2"
                  : "bg-card/60 backdrop-blur-sm border-accent/10"
              }`}
              onClick={() => !dare.is_read && markAsRead(dare.id)}
            >
              <div className="flex gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={dare.sender_avatar || undefined} />
                  {/* <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {dare.sender_name.charAt(0)}
                  </AvatarFallback> */}
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-primary">Your Santa</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{dare.room_name}</span>
                      {!dare.is_read && (
                        <Badge variant="destructive" className="text-xs">
                          NEW
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(dare.created_at)}
                    </span>
                  </div>

                  <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                    <p className="text-base leading-relaxed">{dare.dare_text}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
