import { NextResponse } from 'next/server';
import { getSessionFromToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  const session = await getSessionFromToken();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log("Fetching assignments for user:", session.id);
  // Query assignments and rooms for the current user
const result = await query(
  `SELECT r.*
   FROM room_participants rp
   JOIN rooms r ON rp.room_id = r.id
   WHERE rp.user_id = $1`,
  [session.id]
);
console.log("Assigned rooms fetched:", result.rows);
const rooms = result.rows;
return NextResponse.json({ rooms });

}