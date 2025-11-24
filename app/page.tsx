import Link from 'next/link'
import { Snowfall } from '@/components/snowfall'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <Snowfall />
      
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Logo/Header */}
          <div className="space-y-4">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-balance text-primary animate-fade-in">
              Secret Santa
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground animate-fade-in-delay">
              Spread joy this holiday season
            </p>
          </div>

          {/* Description */}
          <div className="bg-card/80 backdrop-blur-sm border-2 border-accent/20 rounded-2xl p-8 shadow-2xl animate-slide-up">
            <p className="text-lg text-card-foreground/90 leading-relaxed mb-6">
              Create a Secret Santa room, invite your friends and family, and let the magic happen. 
              Everyone gets assigned someone special to surprise with a thoughtful gift.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                <Link href="/auth/signin">
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 border-2">
                <Link href="/join">
                  Join Room
                </Link>
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 animate-fade-in-delay-2">
            <div className="bg-card/60 backdrop-blur-sm border border-accent/10 rounded-xl p-6 hover:border-accent/30 transition-all">
              <div className="text-4xl mb-3">🎄</div>
              <h3 className="font-semibold text-lg mb-2">Easy Setup</h3>
              <p className="text-sm text-muted-foreground">Create a room in seconds and share the code</p>
            </div>
            <div className="bg-card/60 backdrop-blur-sm border border-accent/10 rounded-xl p-6 hover:border-accent/30 transition-all">
              <div className="text-4xl mb-3">🎁</div>
              <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
              <p className="text-sm text-muted-foreground">Random assignments with no self-matches</p>
            </div>
            <div className="bg-card/60 backdrop-blur-sm border border-accent/10 rounded-xl p-6 hover:border-accent/30 transition-all">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold text-lg mb-2">Keep Secrets</h3>
              <p className="text-sm text-muted-foreground">Everyone only sees their assigned person</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
