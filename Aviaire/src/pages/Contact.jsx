import React from 'react'

const Contact = () => {
  return (
    <div className="bg-[#0A0A0A] min-h-screen px-6 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Main Content */}
        <div className="bg-[#111111] border border-white/10 p-8 md:p-16 mt-20 mb-8">
          <h1 className="mb-4 text-3xl font-light tracking-widest text-center text-white">
            CONTACT
          </h1>
          <div className="w-12 h-px bg-[#C9A961] mx-auto mb-10"></div>

          <div className="grid items-start grid-cols-1 gap-10 md:grid-cols-5">
            {/* Left copy */}
            <div className="md:col-span-2">
              <p className="text-center md:text-left text-white/60 tracking-[0.2em] uppercase text-xs mb-6">
                L’ALLURE Concierge
              </p>

              <div className="space-y-5 text-sm leading-relaxed text-white/80">
                <p>
                  For private appointments, collection requests, or discreet support, reach our concierge team.
                  We respond with the same discretion we curate.
                </p>
                <div className="border-l border-[#C9A961] pl-6 my-8">
                  <p className="text-white">
                    <span className="text-[#C9A961]">Email</span> — concierge@lallure.com
                  </p>
                  <p className="mt-2 text-xs text-white/40">
                    Availability: Mon–Sat, 10:00–18:00
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="w-2 h-2 rounded-full bg-[#C9A961]" />
                    <span>Invitation-based access</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <span className="w-2 h-2 rounded-full bg-[#C9A961]" />
                    <span>Craft, rarity, discretion</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-5 md:col-span-3" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-white/60 text-xs tracking-[0.2em] uppercase">Name</span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your name"
                    className="mt-3 w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#C9A961] transition"
                  />
                </label>

                <label className="block">
                  <span className="text-white/60 text-xs tracking-[0.2em] uppercase">Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className="mt-3 w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#C9A961] transition"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-white/60 text-xs tracking-[0.2em] uppercase">Subject</span>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="How can we help?"
                  className="mt-3 w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#C9A961] transition"
                />
              </label>

              <label className="block">
                <span className="text-white/60 text-xs tracking-[0.2em] uppercase">Message</span>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder="Write your message..."
                  className="mt-3 w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#C9A961] transition resize-none"
                />
              </label>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/40">
                  By sending, you agree to be contacted by our concierge team.
                </p>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center bg-[#C9A961] text-black px-10 py-4 text-xs tracking-[0.3em] uppercase hover:bg-[#B89851] transition rounded-lg"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 p-8 md:p-12 mb-8 text-center">
          <h3 className="text-white text-lg font-light tracking-[0.2em] mb-6">
            Discreet. Considered. Prompt.
          </h3>
          <p className="max-w-2xl mx-auto text-sm leading-relaxed text-white/60">
            We handle every request with privacy-first care. For appointments, we respond with available time windows.
          </p>
        </div>

        <p className="text-xs text-center text-white/40">
          © 2026 L’ALLURE. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}

export default Contact

