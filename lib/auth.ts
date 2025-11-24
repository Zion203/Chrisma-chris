import { cookies } from "next/headers"
import { db, type User } from "./db"
import { jwtVerify, SignJWT } from "jose"

// Mock session management
const SESSION_COOKIE_NAME = "secret-santa-session"
const AUTH_TOKEN_COOKIE_NAME = "auth_token"
const SECRET_KEY = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "default-secret-key-change-me")

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) return null

  // In a real app, we'd verify the JWT/Token here.
  // For this mock, the token IS the user ID.
  const user = db.users.get(sessionToken)
  return user || null
}

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload
  } catch (error) {
    return null
  }
}

export async function getSessionFromToken(): Promise<any | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value

  if (!token) return null

  return await verifyToken(token)
}

export async function loginMock(email: string, name: string) {
  // Check if user exists, if not create
  let user: User | undefined

  for (const u of db.users.values()) {
    if (u.email === email) {
      user = u
      break
    }
  }

  if (!user) {
    user = {
      id: Math.random().toString(36).substring(2, 15),
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
    }
    db.users.set(user.id, user)
  }

  const cookieStore = await cookies()
  // Set httpOnly cookie for 30 days
  const token = await signToken({ userId: user.id })
  cookieStore.set(AUTH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })

  return user
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  cookieStore.delete(AUTH_TOKEN_COOKIE_NAME)
}
