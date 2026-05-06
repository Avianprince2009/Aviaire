import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import rollex from '../assets/rollex.png'
import gshock from '../assets/gshock.jpg'
import client1 from '../assets/client1.jpg'
import client2 from '../assets/client2.jpg'

const About = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef(null)

  const testimonials = [
    {
      id: 1,
      quote: "The only house that understands acquisition should be private. L’ALLURE does not sell watches — they grant custody.",
      name: "A.M.",
      location: "Geneva",
      image: client1
    },
    {
      id: 2,
      quote: "Discretion and excellence. In five years, I have never seen another client wear the same reference. That is the standard.",
      name: "K.R.",
      location: "Dubai",
      image: client2
    }
  ]

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0? testimonials.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        nextSlide()
      }, 4000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPaused, currentIndex])

  return (
    <div className="bg-[#0A0A0A] min-h-screen px-6 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Main Content */}
        <div className="bg-[#111111] border border-white/10 p-8 md:p-16 mt-20 mb-8">
          <h1 className="mb-4 text-3xl font-light tracking-widest text-center text-white">
            L’ALLURE
          </h1>
          <div className="w-12 h-px bg-[#C9A961] mx-auto mb-12"></div>

          <div className="max-w-3xl mx-auto space-y-8 text-sm leading-relaxed text-white/80">
            <p className="text-center text-white/60 tracking-[0.2em] uppercase text-xs mb-8">
              Established 2026
            </p>

            <p>
              L’ALLURE exists for those who understand that true luxury is not announced —
              it is recognized. We curate exceptional pieces for clients who value discretion,
              craftsmanship, and rarity above all else.
            </p>

            <p>
              Every item in our collection is sourced privately and offered by invitation only.
              We do not follow seasons. We do not chase trends. We present only what endures.
            </p>

            <div className="border-l border-[#C9A961] pl-6 my-12">
              <p className="italic text-white">
                "Elegance is refusal."
              </p>
              <p className="mt-2 text-xs tracking-wider text-white/40">
                — The House Principle
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 p-8 md:p-12 mb-8">
          <h2 className="text-white text-xl font-light tracking-[0.3em] uppercase text-center mb-12">
            Client Reflections
          </h2>

          <div
            className="relative max-w-2xl mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="p-8 border border-white/10 md:p-12 min-h-80">
              <div className="flex flex-col items-center text-center">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="object-cover w-16 h-16 mb-8 border rounded-full grayscale border-white/20"
                />
                <p className="mb-8 text-sm italic leading-relaxed text-white/70">
                  "{testimonials[currentIndex].quote}"
                </p>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-[#C9A961] text-xs tracking-[0.2em] uppercase">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    {testimonials[currentIndex].location}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 text-white/40 hover:text-[#C9A961] transition text-2xl"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 text-white/40 hover:text-[#C9A961] transition text-2xl"
            >
              ›
            </button>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition ${currentIndex === idx? 'bg-[#C9A961]' : 'bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 p-8 md:p-12 mb-8 text-center">
          <h3 className="text-white text-lg font-light tracking-[0.2em] mb-6">
            Membership by Invitation
          </h3>
          <Link
            to="/register"
            className="inline-block bg-[#C9A961] text-black px-12 py-4 text-xs tracking-[0.3em] uppercase hover:bg-[#B89851] transition"
          >
            Request Access
          </Link>
        </div>

        <p className="text-xs text-center text-white/40">
          © 2026 L’ALLURE. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}

export default About