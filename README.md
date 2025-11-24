# 🎅 Secret Santa App

A beautiful, classy Christmas-themed Secret Santa application with Google OAuth authentication and real-time room management.

## Features

- 🔐 **Google OAuth Login** - Secure authentication with 30-day persistent sessions
- 🎄 **Create & Join Rooms** - Generate unique 6-letter codes to share with friends
- 🎁 **Smart Matching** - Derangement algorithm ensures nobody gets themselves
- 📧 **Email Notifications** - Host receives full assignment list via email
- 🎨 **Classy Christmas Design** - Elegant burgundy, cream, and gold theme with animations
- 📱 **Mobile Responsive** - Works beautifully on all devices

## Setup Instructions

### 1. Database Setup

This app requires a PostgreSQL database. We recommend [Supabase](https://supabase.com) (free tier available) or [Neon](https://neon.tech).

1. Create a new PostgreSQL database
2. Run the SQL schema from `scripts/001_create_schema.sql`
3. Copy your database connection string

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback` (and your production URL)
6. Copy your Client ID and Client Secret

### 3. Email Setup (Optional)

For host email notifications:

1. Sign up at [Resend](https://resend.com) (free tier: 100 emails/day)
2. Get your API key
3. Verify your sending domain (or use sandbox for testing)

### 4. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your credentials:

\`\`\`env
DATABASE_URL=your_postgres_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
RESEND_API_KEY=your_resend_api_key (optional)
FROM_EMAIL=noreply@yourdomain.com (optional)
\`\`\`

### 5. Install & Run

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000` and enjoy! 🎄

## How It Works

1. Users sign in with Google (session lasts 30 days)
2. Host creates a room and shares the join code
3. Participants join using the code
4. Host clicks "Start" to generate Secret Santa assignments
5. Host receives email with full list (for backup)
6. Each participant can return anytime to see only their assigned person

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript**
- **PostgreSQL** (raw SQL, no ORM)
- **Google OAuth 2.0**
- **JWT** for session management
- **Resend** for emails
- **Tailwind CSS v4** with custom Christmas theme
- **shadcn/ui** components

## License

MIT - Feel free to use for your holiday parties! 🎁
