import { type NextRequest, NextResponse } from "next/server"
import { getSessionFromToken } from "@/lib/auth"
import { query } from "@/lib/db"
import { generateRoomCode } from "@/lib/utils"

export async function POST(request: NextRequest) {
  const session = await getSessionFromToken()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    // Generate unique code
    let code = generateRoomCode()
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 5) {
      const checkResult = await query("SELECT id FROM rooms WHERE code = $1", [code])
      if (checkResult.rows.length === 0) {
        isUnique = true
      } else {
        code = generateRoomCode()
        attempts++
      }
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate unique code" }, { status: 500 })
    }

    await query("BEGIN")

    const roomResult = await query(
      `INSERT INTO rooms (code, name, host_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, code, name, host_id, created_at`,
      [code, name, session.id],
    )

    const room = roomResult.rows[0]

    await query(
      `INSERT INTO room_participants (room_id, user_id) 
       VALUES ($1, $2)`,
      [room.id, session.id],
    )

    await query("COMMIT")

    return NextResponse.json({ room })
  } catch (error) {
    await query("ROLLBACK")
    console.error("Create room error:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}
