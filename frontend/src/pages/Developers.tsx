"use client"

import type React from "react"
import { useEffect, useState } from "react"
import GKImage from "../../public/images/GK.jpg"
import SSGImage from "../../public/images/SSG.jpg"

const developers = [
  {
    name: "GokulaKrishnan K",
    role: "Full Stack Developer",
    image: GKImage,
    linkedin: "",
    github: "https://github.com/Gokulakrishnan610",
  },
  {
    name: "Siva Sabari Ganesan A",
    role: "Full Stack Developer",
    image: SSGImage,
    linkedin: "",
    github: "https://github.com/SivaSabariGanesan",
  },
]

const LinkedInIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.845-1.563 3.043 0 3.604 2.004 3.604 4.609v5.587z" />
  </svg>
)

const GitHubIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576 4.765-1.588 8.199-6.084 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
)

// Particle component
const Particle: React.FC<{ x: number; y: number; size: number; color: string; delay: number }> = ({ x, y, size, color, delay }) => (
  <div
    className="absolute rounded-full animate-pulse"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      animationDelay: `${delay}s`,
      animationDuration: '3s',
      boxShadow: `0 0 ${size * 2}px ${color}`,
    }}
  />
)

// Floating particle component
const FloatingParticle: React.FC<{ x: number; y: number; size: number; color: string; duration: number; delay: number }> = ({ x, y, size, color, duration, delay }) => (
  <div
    className="absolute rounded-full"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      animation: `float ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      boxShadow: `0 0 ${size * 1.5}px ${color}`,
    }}
  />
)

export const DeveloperCards: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; delay: number }>>([])
  const [floatingParticles, setFloatingParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; duration: number; delay: number }>>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [clickParticles, setClickParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; createdAt: number }>>([])

  useEffect(() => {
    // Generate static particles - more and larger
    const staticParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3, // Larger particles (3-9px)
      color: ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 6)],
      delay: Math.random() * 2,
    }))

    // Generate floating particles - more and larger
    const floatingParticlesData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 100,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2, // Larger floating particles (2-6px)
      color: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 4)],
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    }))

    setParticles(staticParticles)
    setFloatingParticles(floatingParticlesData)

    // Mouse move handler for cursor interaction
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    // Click handler for creating new particles
    const handleClick = (e: MouseEvent) => {
      const clickX = (e.clientX / window.innerWidth) * 100
      const clickY = (e.clientY / window.innerHeight) * 100
      
      // Create 3-5 particles at click location
      const newParticles = Array.from({ length: Math.floor(Math.random() * 3) + 3 }, (_, i) => ({
        id: Date.now() + i,
        x: clickX + (Math.random() - 0.5) * 10, // Spread around click point
        y: clickY + (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 4, // Larger click particles (4-12px)
        color: ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#ffffff'][Math.floor(Math.random() * 7)],
        createdAt: Date.now(),
      }))
      
      setClickParticles(prev => [...prev, ...newParticles])
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    // Inject CSS for floating animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) translateX(0px);
          opacity: 0.8;
        }
        25% {
          transform: translateY(-30px) translateX(15px);
          opacity: 1;
        }
        50% {
          transform: translateY(-15px) translateX(-10px);
          opacity: 0.9;
        }
        75% {
          transform: translateY(-25px) translateX(20px);
          opacity: 1;
        }
      }
      
      @keyframes pulse-glow {
        0%, 100% {
          opacity: 0.6;
          transform: scale(1);
        }
        50% {
          opacity: 1;
          transform: scale(1.2);
        }
      }
      
      @keyframes click-particle {
        0% {
          transform: scale(0) rotate(0deg);
          opacity: 1;
        }
        50% {
          transform: scale(1.5) rotate(180deg);
          opacity: 0.8;
        }
        100% {
          transform: scale(2) rotate(360deg);
          opacity: 0;
        }
      }
      
      .particle-interactive {
        transition: all 0.3s ease;
      }
      
      .particle-interactive:hover {
        transform: scale(1.5);
        opacity: 1;
        filter: brightness(1.5);
      }
      
      .click-particle {
        animation: click-particle 2s ease-out forwards;
        pointer-events: none;
      }
    `
    document.head.appendChild(style)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      document.head.removeChild(style)
    }
  }, [])

  // Clean up old click particles (older than 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setClickParticles(prev => prev.filter(particle => Date.now() - particle.createdAt < 3000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Calculate distance between mouse and particle for interaction
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden py-16 px-8">
      {/* Particle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Static particles with cursor interaction */}
        {particles.map((particle) => {
          const distance = getDistance(mousePosition.x, mousePosition.y, particle.x, particle.y)
          const isNearCursor = distance < 15
          
          return (
            <div
              key={particle.id}
              className={`absolute rounded-full animate-pulse particle-interactive ${
                isNearCursor ? 'z-20' : 'z-10'
              }`}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                animationDelay: `${particle.delay}s`,
                animationDuration: '3s',
                boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
                transform: isNearCursor ? 'scale(1.5)' : 'scale(1)',
                opacity: isNearCursor ? 1 : 0.8,
                filter: isNearCursor ? 'brightness(1.5)' : 'brightness(1)',
                transition: 'all 0.3s ease',
              }}
            />
          )
        })}
        
        {/* Floating particles with cursor interaction */}
        {floatingParticles.map((particle) => {
          const distance = getDistance(mousePosition.x, mousePosition.y, particle.x, particle.y)
          const isNearCursor = distance < 20
          
          return (
            <div
              key={particle.id}
              className={`absolute rounded-full particle-interactive ${
                isNearCursor ? 'z-20' : 'z-10'
              }`}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                animation: `float ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
                boxShadow: `0 0 ${particle.size * 2.5}px ${particle.color}`,
                transform: isNearCursor ? 'scale(1.8)' : 'scale(1)',
                opacity: isNearCursor ? 1 : 0.9,
                filter: isNearCursor ? 'brightness(1.8)' : 'brightness(1)',
                transition: 'all 0.3s ease',
              }}
            />
          )
        })}

        {/* Click particles */}
        {clickParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full click-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
            }}
          />
        ))}
      </div>



      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Clean Developer Team Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">Meet Our Developers</h1>
          <p className="text-gray-400 text-lg">Talented developers crafting innovative solutions</p>
        </div>

        {/* Developer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          {developers.map((dev, index) => (
            <div
              key={index}
              className="bg-black/80 border border-gray-700/50 rounded-2xl p-8 w-full max-w-sm backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300"
            >
              {/* Profile Image */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-600/50 hover:border-cyan-400/50 transition-all duration-300">
                  <img src={dev.image || "/placeholder.svg"} alt={dev.name} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Name */}
              <h2 className="text-white text-2xl font-semibold text-center mb-2">{dev.name}</h2>

              {/* Role */}
              <p className="text-cyan-400 text-lg text-center mb-8">{dev.role}</p>

              {/* Social Links */}
              <div className="flex justify-center gap-6">
                {dev.linkedin && (
                  <a
                    href={dev.linkedin}
                    className="p-3 rounded-full bg-gray-800/50 border border-gray-600/30 text-gray-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-all duration-300"
                  >
                    <LinkedInIcon />
                  </a>
                )}
                {dev.github && (
                  <a
                    href={dev.github}
                    className="p-3 rounded-full bg-gray-800/50 border border-gray-600/30 text-gray-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-all duration-300"
                  >
                    <GitHubIcon />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DeveloperCards 