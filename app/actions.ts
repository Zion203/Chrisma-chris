"use server"

import { db, generateRoomCode, type User } from "@/lib/db"
import { getSession, loginMock, logout as logoutAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// --- Auth Actions ---

export async function loginWithGoogle(formData: FormData) {
  // This mocks the Google OAuth flow.
  // In a real app, this would redirect to Google's OAuth URL.
  const email = formData.get("email") as string
  const name = formData.get("name") as string // In real OAuth, we'd get this from the profile

  if (!email || !name) {
    throw new Error("Invalid login data")
  }

  await loginMock(email, name)
  redirect("/dashboard")
}

export async function logout() {
  await logoutAuth()
  redirect("/")
}

// --- Room Actions ---

export async function createRoom() {
  const user = await getSession()
  if (!user) throw new Error("Not authenticated")

  const code = generateRoomCode()

  db.rooms.set(code, {
    code,
    hostId: user.id,
    status: "waiting",
    participants: [user.id],
  })

  redirect(`/room/${code}`)
}

export async function joinRoom(code: string) {
  const user = await getSession()
  if (!user) throw new Error("Not authenticated")

  const room = db.rooms.get(code.toUpperCase())
  if (!room) {
    return { error: "Room not found" }
  }

  if (!room.participants.includes(user.id)) {
    // Assuming we can't join if started? Or maybe we can if we just want to see?
    // The prompt says "participant can come back anytime", so we assume open joining until start
    if (room.status === "started") {
      // If started, only allow if already a participant
      // But if they are not in participants, they can't join a started room
      return { error: "Room has already started" }
    }
    room.participants.push(user.id)
  }

  redirect(`/room/${room.code}`)
}

export async function startRoom(code: string) {
  const user = await getSession()
  if (!user) throw new Error("Not authenticated")

  const room = db.rooms.get(code)
  if (!room) throw new Error("Room not found")
  if (room.hostId !== user.id) throw new Error("Only host can start")
  if (room.participants.length < 3) {
    // Technically 2 is possible for secret santa but 3 is safer for derangement guarantees without immediate cycle A->B, B->A usually desired
    // But let's allow 2 for testing if needed, though derangement of 2 is just swap.
    // Prompt says "Randomly assign... ensure no one gets themselves".
  }

  // Derangement Algorithm
  const participants = [...room.participants]
  const assignments: { giver: string; receiver: string }[] = []

  // Simple shuffle until no one matches themselves
  // For small N, this is efficient enough.
  const shuffled = [...participants]
  let isValid = false

  while (!isValid) {
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    isValid = true
    for (let i = 0; i < participants.length; i++) {
      if (participants[i] === shuffled[i]) {
        isValid = false
        break
      }
    }
  }

  // Save assignments
  for (let i = 0; i < participants.length; i++) {
    const assignment = {
      roomId: room.code,
      giverId: participants[i],
      receiverId: shuffled[i],
    }
    db.assignments.push(assignment)
    assignments.push({ giver: participants[i], receiver: shuffled[i] })
  }

  room.status = "started"

  // Mock Email Sending
  console.log(`[EMAIL] Sending assignment list to host ${user.email}:`, assignments)

  revalidatePath(`/room/${code}`)
}

export async function getRoomData(code: string) {
  const user = await getSession()
  if (!user) return null

  const room = db.rooms.get(code)
  if (!room) return null

  // Hydrate participants
  const participants = room.participants.map((id) => db.users.get(id)).filter(Boolean) as User[]

  // Get user's assignment if started
  let myAssignment = null
  if (room.status === "started") {
    const assignment = db.assignments.find((a) => a.roomId === code && a.giverId === user.id)
    if (assignment) {
      myAssignment = db.users.get(assignment.receiverId)
    }
  }

  return {
    room,
    participants,
    isHost: room.hostId === user.id,
    myAssignment,
    currentUser: user,
  }
}
