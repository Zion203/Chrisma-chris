import { RoomContent } from "@/components/room/room-content"
import { Snowfall } from "@/components/snowfall"
import { Header } from "@/components/header"

// 1. Update the type definition to be a Promise
interface RoomPageProps {
  params: Promise<{ code: string }>
}

// 2. Make the component async
export default async function RoomPage({ params }: RoomPageProps) {
  // 3. Await the params
  const resolvedParams = await params
  console.log("RoomPage received code:", resolvedParams.code)
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <Snowfall />
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* 4. Use the resolved variable */}
        <RoomContent code={resolvedParams.code} />
      </div>
    </div>
  )
}