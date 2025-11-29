import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSessionFromToken } from "@/lib/auth"

export async function GET(req: Request) {
  // Get the current user session
  const user = await getSessionFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all dares received by the current user
    const daresResult = await query(
      `SELECT 
        d.id,
        d.dare_text,
        d.is_read,
        d.created_at,
        u.name as sender_name,
        u.avatar_url as sender_avatar,
        r.name as room_name,
        r.code as room_code
       FROM dares d
       JOIN users u ON d.sender_id = u.id
       JOIN rooms r ON d.room_id = r.id
       WHERE d.receiver_id = $1
       ORDER BY d.created_at DESC`,
      [user.id]
    )

    // Get count of unread dares
    const unreadCountResult = await query(
      "SELECT COUNT(*) as unread_count FROM dares WHERE receiver_id = $1 AND is_read = false",
      [user.id]
    )

    return NextResponse.json({
      dares: daresResult.rows,
      unreadCount: parseInt(unreadCountResult.rows[0].unread_count),
    })
  } catch (error) {
    console.error("Error fetching dares:", error)
    return NextResponse.json({ error: "Failed to fetch dares" }, { status: 500 })
  }
}

// Mark dare as read
export async function PATCH(req: Request) {
  const user = await getSessionFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { dareId } = body

  if (!dareId) {
    return NextResponse.json({ error: "Dare ID is required" }, { status: 400 })
  }

  try {
    // Update dare to mark as read
    const result = await query(
      `UPDATE dares 
       SET is_read = true, read_at = NOW() 
       WHERE id = $1 AND receiver_id = $2 AND is_read = false
       RETURNING id`,
      [dareId, user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Dare not found or already read" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking dare as read:", error)
    return NextResponse.json({ error: "Failed to update dare" }, { status: 500 })
  }
}
