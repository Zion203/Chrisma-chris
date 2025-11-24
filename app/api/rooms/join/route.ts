import { type NextRequest, NextResponse } from "next/server"
import { getSessionFromToken } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  const session = await getSessionFromToken()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { code } = await request.json()
    console.log("Join room request for code:", code, "by user:", session.id)

    if (!code) {
      return NextResponse.json({ error: "Room code is required" }, { status: 400 })
    }

    // 1. Get the room
    const roomResult = await query("SELECT id, status, name FROM rooms WHERE code = $1", [code.toUpperCase()])

    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = roomResult.rows[0]

    // 2. Check if the user is ALREADY in the room
    // We do this check now regardless of status, to prevent duplicates
    const existingParticipant = await query(
      "SELECT id FROM room_participants WHERE room_id = $1 AND user_id = $2",
      [room.id, session.id]
    )
    
    const isAlreadyInRoom = existingParticipant.rows.length > 0

    // 3. Handle "Started" logic
    if (room.status === "started") {
      // If room started and user is NOT in the list -> Error
      if (!isAlreadyInRoom) {
        return NextResponse.json({ error: "Room has already started" }, { status: 403 })
      }
      // If room started and user IS in list -> Just let them proceed (return success at bottom)
    }

    // 4. Insert ONLY if they are not already there
    // This replaces the 'ON CONFLICT DO NOTHING' logic
    if (!isAlreadyInRoom) {
      await query(
        `INSERT INTO room_participants (room_id, user_id) 
         VALUES ($1, $2)`,
        [room.id, session.id]
      )
    }

    return NextResponse.json({ success: true, code: code.toUpperCase(), name: room.name })

  } catch (error) {
    console.error("Join room error:", error)
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 })
  }
}