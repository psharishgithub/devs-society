"use client"

import type React from "react"
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

export const DeveloperCards: React.FC = () => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden py-16 px-8">
      {/* Background with glowing dots */}
      <div className="absolute inset-0">
        {/* Glowing dots */}
        <div className="absolute top-16 left-16 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
        <div
          className="absolute bottom-16 left-16 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-16 right-16 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-16 right-16 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Additional accent dots */}
        <div className="absolute bottom-32 left-1/2 w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
        <div
          className="absolute top-1/3 right-32 w-1 h-1 bg-pink-500 rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
          style={{ animationDelay: "2.5s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-pink-500 rounded-full animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
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
              className="bg-black/80 border border-gray-700/50 rounded-2xl p-8 w-full max-w-sm backdrop-blur-sm"
            >
              {/* Profile Image */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-600/50">
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