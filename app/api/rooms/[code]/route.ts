import { type NextRequest, NextResponse } from "next/server"
import { getSessionFromToken } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(
  request: NextRequest,
  // 1. Update the type here to wrap params in a Promise
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await getSessionFromToken()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 2. Await the params before using them
    const { code } = await params
    
    // Now you can safely use 'code'
    const upperCode = code.toUpperCase()

    const roomResult = await query(
      `SELECT r.*, 
        (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as participant_count,
        CASE WHEN r.host_id = $1 THEN true ELSE false END as is_host
       FROM rooms r 
       WHERE r.code = $2`,
      [session.id, upperCode],
    )

    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = roomResult.rows[0]

    const participantCheck = await query("SELECT id FROM room_participants WHERE room_id = $1 AND user_id = $2", [
      room.id,
      session.id,
    ])

    if (participantCheck.rows.length === 0) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 })
    }

    const participantsResult = await query(
      `SELECT u.id, u.name, u.avatar_url 
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1`,
      [room.id],
    )

    let assignment = null
    if (room.started) {
      const assignmentResult = await query(
        `SELECT u.name, u.avatar_url
         FROM assignments a
         JOIN users u ON a.receiver_id = u.id
         WHERE a.room_id = $1 AND a.giver_id = $2`,
        [room.id, session.id],
      )

      if (assignmentResult.rows.length > 0) {
        assignment = assignmentResult.rows[0]
      }
    }

    return NextResponse.json({
      room: {
        ...room,
        participants: participantsResult.rows,
        assignment,
      },
    })
  } catch (error) {
    console.error("Get room error:", error)
    return NextResponse.json({ error: "Failed to fetch room data" }, { status: 500 })
  }
}
