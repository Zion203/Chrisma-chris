import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generateAssignments(participants: { id: string; name: string; email: string }[]) {
  if (participants.length < 2) {
    throw new Error("Need at least 2 participants for Secret Santa")
  }

  const givers = [...participants]
  const receivers = [...participants]
  let isValid = false

  // Shuffle until we get a valid derangement
  while (!isValid) {
    for (let i = receivers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[receivers[i], receivers[j]] = [receivers[j], receivers[i]]
    }

    isValid = true
    for (let i = 0; i < givers.length; i++) {
      if (givers[i].id === receivers[i].id) {
        isValid = false
        break
      }
    }
  }

  return givers.map((giver, index) => ({
    giver,
    receiver: receivers[index],
  }))
}
