import bgvideo from '../assets/bgvideo.mp4'
import logo from '../assets/Logo.png'
import { Link } from 'react-router-dom'
const Home = () => {
  return (
    <div className="relative w-full min-h-screen mt-5 overflow-hidden">
      <video
        className="fixed inset-0 object-cover w-full h-full"
        autoPlay
        loop
        muted
      >
        <source src={bgvideo} type="video/mp4" />
      </video>
      <div className="fixed inset-0 z-10 bg-black/40"></div>
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="space-y-8">
          <h1
            className="text-7xl md:text-8xl lg:text-9xl font-semibold text-yellow-300 drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] transition duration-700 ease-out"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            L'ALLURE
          </h1>
          <p
            className="max-w-3xl text-xl leading-relaxed tracking-wide transition duration-700 ease-out md:text-3xl text-yellow-100/90 hover:text-yellow-200"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            "WHERE CENTURIES OF CRAFTSMANSHIP<br />
            CONVERGE UPON A SINGLE MOMENT IN TIME"
          </p>
          <Link to="/collections" className="inline-flex items-center justify-center bg-white text-black px-8 py-3.5 font-medium tracking-wider shadow-[0_4px_20px rgba(0,0,0,0.3)] hover:shadow-[0_6px_24px rgba(0,0,0,0.4)] transition-all duration-200 ease-in-out ">
            DISCOVER THE COLLECTION
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
