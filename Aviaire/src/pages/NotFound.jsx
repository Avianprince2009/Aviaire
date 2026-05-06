import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-linear-to-br from-yellow-400 via-yellow-500 to-black text-yellow-300 text-center p-8">
      <h1 className="text-8xl font-bold m-0 drop-shadow-2xl animate-pulse">404</h1>
      <p className="text-3xl mt-6 font-semibold">Oops! Page Not Found</p>
      <p className="text-lg mt-4 mb-8">The page you're looking for doesn't exist.</p>
      <Link 
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-full transition duration-300 shadow-lg" 
        to="/"
      >
        Go Home
      </Link>
    </div>
  )
}

export default NotFound
