"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function SnowFall() {
  const [snowflakes, setSnowflakes] = useState<{ id: number; x: number; delay: number; duration: number }[]>([])

  useEffect(() => {
    const count = 30
    const newSnowflakes = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    }))
    setSnowflakes(newSnowflakes)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute top-[-10px] w-2 h-2 bg-white rounded-full opacity-20"
          style={{ left: `${flake.x}%` }}
          animate={{
            y: ["-10vh", "110vh"],
            x: [`${flake.x}%`, `${flake.x + (Math.random() * 10 - 5)}%`],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}
