import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Shield, Zap, Layers, Globe, Code, Cpu } from 'lucide-react'
import { Link } from 'react-router-dom'

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 py-6">
    <div className="container mx-auto px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">EduS-X</span>
      </div>
      <div>
        <Link to="/login" className="mr-4">Login</Link>
        <Link to="/register" className="px-4 py-2 bg-white/10 rounded">Sign up</Link>
      </div>
    </div>
  </nav>
)

const Hero = () => (
  <section className="min-h-[80vh] flex items-center justify-center pt-24">
    <div className="text-center px-6">
      <h1 className="text-5xl md:text-6xl font-bold mb-4">The future of digital learning</h1>
      <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">Personalized, explainable AI tutor for students and educators.</p>
      <div className="flex gap-4 justify-center">
        <Link to="/register" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded shadow">Get Started</Link>
        <Link to="/login" className="px-6 py-3 border border-white/10 rounded">Sign In</Link>
      </div>
    </div>
  </section>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen relative bg-neutral-900 text-white overflow-hidden">
      {/* Gradient/background orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-purple-700 via-pink-600 to-yellow-400 opacity-20 blur-3xl transform -translate-x-1/2 animate-pulse" />
        <div className="absolute top-1/3 right-0 w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-indigo-600 via-sky-500 to-green-400 opacity-15 blur-3xl transform translate-x-1/4 animate-pulse" />
        <div className="absolute bottom-0 left-1/3 w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-pink-700 via-purple-600 to-indigo-500 opacity-10 blur-4xl transform -translate-x-1/3 animate-pulse" />
      </div>

      <Navbar />
      <main className="pt-24">
        <Hero />
      </main>
      <footer className="py-8 text-center text-white/60">© 2025 EduS-X</footer>
    </div>
  )
}
