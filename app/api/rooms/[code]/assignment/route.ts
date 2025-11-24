import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getSessionFromToken } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { code: string } }) {
  // Get the current user session
  const user = await getSessionFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
      const { code } = await params

const roomResult = await query(
  "SELECT id FROM rooms WHERE code = $1", 
  [code]
)

if (roomResult.rows.length === 0) {
  return NextResponse.json({ error: "Room not found" }, { status: 404 })
}

const roomId = roomResult.rows[0].id

// Step 2: Get the Receiver's Name
// Now we only need to join 2 tables (Assignments + Users) which is much cleaner
const assignmentResult = await query(
  `SELECT u.name as giftee_name 
   FROM assignments a
   JOIN users u ON a.receiver_id = u.id
   WHERE a.room_id = $1 AND a.giver_id = $2`,
  [roomId, user.id]
)
  console.log("Assignment query result:", assignmentResult)
  if (!assignmentResult.rows.length) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
  }

  const assignment = { giftee_name: assignmentResult.rows[0].giftee_name }
  return NextResponse.json({ assignment })
}
