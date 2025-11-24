import { type NextRequest, NextResponse } from "next/server"
import { getSessionFromToken } from "@/lib/auth"
import { query } from "@/lib/db"
import { generateAssignments } from "@/lib/utils"
import { Resend } from "resend"

export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await getSessionFromToken()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { code } = await params
    console.log("Room code:", code)
    const upperCode = code.toUpperCase()

    const roomResult = await query("SELECT * FROM rooms WHERE code = $1", [upperCode])

    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    const room = roomResult.rows[0]

    if (room.host_id !== session.id) {
      return NextResponse.json({ error: "Only host can start the room" }, { status: 403 })
    }

    if (room.state === "started") {
      return NextResponse.json({ error: "Room already started" }, { status: 400 })
    }

    const participantsResult = await query(
      `SELECT u.id, u.name, u.email 
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1`,
      [room.id],
    )

    const participants = participantsResult.rows

    if (participants.length < 2) {
      return NextResponse.json({ error: "Need at least 2 participants" }, { status: 400 })
    }

    const assignments = generateAssignments(participants)

    await query("BEGIN")

    for (const assignment of assignments) {
      await query(
        `INSERT INTO assignments (room_id, giver_id, receiver_id)
         VALUES ($1, $2, $3)`,
        [room.id, assignment.giver.id, assignment.receiver.id],
      )
    }

    await query("UPDATE rooms SET status = 'started' WHERE id = $1", [room.id])

    await query("COMMIT")

    // Send email to host if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        console.log("Sending assignments email to host at:")
        const assignmentsList = assignments.map((a) => `${a.giver.name} → ${a.receiver.name}`).join("\n")

        await resend.emails.send({
          from: "onboarding@resend.dev",
          to: "jesudaszion@gmail.com",
          subject: `Secret Santa Assignments for ${room.name}`,
          html: `
            <h1>🎅 Secret Santa Assignments</h1>
            <p>The assignments have been generated for your room: <strong>${room.name}</strong></p>
            <p>Here is the full list for your reference:</p>
            <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px;">${assignmentsList}</pre>
            <p>🎄 Merry Christmas!</p>
          `,
        })
      } catch (emailError) {
        console.error("Failed to send email:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    await query("ROLLBACK")
    console.error("Start room error:", error)
    return NextResponse.json({ error: "Failed to start room" }, { status: 500 })
  }
}
