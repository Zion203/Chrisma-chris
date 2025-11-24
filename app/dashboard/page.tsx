import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { Snowfall } from "@/components/snowfall"
import { Header } from "@/components/header"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <Snowfall />
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <DashboardContent />
      </div>
    </div>
  )
}
