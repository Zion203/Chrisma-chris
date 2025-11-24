// This is a mock database implementation.
// In a real application, you would use Supabase, Postgres, or another persistent storage.
// Since integrations were declined, we use in-memory storage which will reset on server restarts.

import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const query = (text: string, params?: any[]) => pool.query(text, params)

export default pool

export type User = {
  id: string
  email: string
  name: string
  avatar?: string
}

export type Room = {
  code: string
  hostId: string
  status: "waiting" | "started"
  participants: string[] // Array of User IDs
}

export type Assignment = {
  roomId: string
  giverId: string
  receiverId: string
}

// Global state to persist across hot reloads in development (to some extent)
const globalForDb = global as unknown as {
  users: Map<string, User>
  rooms: Map<string, Room>
  assignments: Assignment[]
}

export const db = {
  users: globalForDb.users || new Map<string, User>(),
  rooms: globalForDb.rooms || new Map<string, Room>(),
  assignments: globalForDb.assignments || [],
}

if (process.env.NODE_ENV !== "production") {
  globalForDb.users = db.users
  globalForDb.rooms = db.rooms
  globalForDb.assignments = db.assignments
}

// Helper to generate room codes
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
