import { type NextRequest, NextResponse } from "next/server"
import { signToken } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/auth/signin?error=missing_code", request.url))
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback",
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      throw new Error("Failed to get access token")
    }

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const userData = await userResponse.json()

    // Save or update user in database
    const result = await query(
      `INSERT INTO users (google_id, email, name, avatar_url) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (google_id) 
       DO UPDATE SET name = $3, avatar_url = $4, updated_at = NOW()
       RETURNING id, name, email, avatar_url`,
      [userData.id, userData.email, userData.name, userData.picture],
    )

    const user = result.rows[0]

    // Create JWT session token
    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.avatar_url,
    })

    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    // Set httpOnly cookie for 30 days
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.redirect(new URL("/auth/signin?error=auth_failed", request.url))
  }
}
