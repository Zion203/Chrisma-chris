import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSessionFromToken } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  // Get the current user session
  const user = await getSessionFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { code } = await params
  const body = await req.json()
  const { dare, receiverId } = body

  if (!dare || !dare.trim()) {
    return NextResponse.json({ error: "Dare text is required" }, { status: 400 })
  }

  if (!receiverId) {
    return NextResponse.json({ error: "Receiver ID is required" }, { status: 400 })
  }

  try {
    // Get room ID from code
    const roomResult = await query("SELECT id FROM rooms WHERE code = $1", [code])

    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const roomId = roomResult.rows[0].id

    // Verify that the sender is actually assigned to this receiver in this room
    const assignmentCheck = await query(
      "SELECT id FROM assignments WHERE room_id = $1 AND giver_id = $2 AND receiver_id = $3",
      [roomId, user.id, receiverId]
    )

    if (assignmentCheck.rows.length === 0) {
      return NextResponse.json({ error: "You are not assigned to send dares to this person" }, { status: 403 })
    }

    // Insert the dare
    const result = await query(
      `INSERT INTO dares (room_id, sender_id, receiver_id, dare_text, is_read) 
       VALUES ($1, $2, $3, $4, false) 
       RETURNING id, created_at`,
      [roomId, user.id, receiverId, dare.trim()]
    )

    return NextResponse.json({
      success: true,
      dare: {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at,
      },
    })
  } catch (error) {
    console.error("Error saving dare:", error)
    return NextResponse.json({ error: "Failed to save dare" }, { status: 500 })
  }
}
