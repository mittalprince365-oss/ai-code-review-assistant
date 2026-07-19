import { Link, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'

function Navbar({ userEmail }) {
  const location = useLocation()

  const linkStyle = (path) =>
    location.pathname === path
      ? 'bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium'
      : 'text-gray-300 hover:text-white px-4 py-2 rounded text-sm font-medium'

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="text-white font-bold text-lg">
            ⚡ AI Code Review
          </span>
          <div className="flex gap-2">
            <Link to="/" className={linkStyle('/')}>
              Review
            </Link>
            <Link to="/history" className={linkStyle('/history')}>
              History
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{userEmail}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar