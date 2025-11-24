"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ShareCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomName: string
  roomCode: string
}

export function ShareCodeDialog({ open, onOpenChange, roomName, roomCode }: ShareCodeDialogProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${roomCode}` : ""

  const shareMessage = `Join my Secret Santa "${roomName}"!\n\nRoom Code: ${roomCode}\n\nOr visit: ${shareUrl}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Share Room</DialogTitle>
          <DialogDescription>Share this code with others so they can join your Secret Santa room.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Room Code</Label>
            <div className="flex gap-2">
              <Input readOnly value={roomCode} className="font-mono text-2xl tracking-wider font-bold text-center" />
              <Button variant="outline" onClick={handleCopy} className="shrink-0 bg-transparent">
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="p-3 bg-muted rounded-lg break-all text-sm font-mono">{shareUrl}</div>
          </div>
        </div>

        <Button onClick={handleCopy} className="w-full">
          {copied ? "Copied to Clipboard!" : "Copy Share Message"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
