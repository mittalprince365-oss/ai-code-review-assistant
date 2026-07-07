import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'

function App() {
  const [session, setSession] = useState(null)
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => listener.subscription.unsubscribe()
  }, [])

  if (!session) return <Login />

  const handleReview = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code, language: 'javascript' }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Could not reach the server' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">AI Code Review Assistant</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{session.user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        className="w-full h-48 bg-gray-800 border border-gray-700 rounded p-3 font-mono text-sm"
      />
      <button
        onClick={handleReview}
        disabled={loading}
        className="mt-3 bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded font-medium disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Review Code'}
      </button>
      {result && (
        <pre className="mt-4 bg-gray-800 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )}

export default App