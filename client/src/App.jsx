import { useState } from 'react'

function App() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleReview = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: 'javascript' }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ error: 'Could not reach the server' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">AI Code Review Assistant</h1>
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
        <pre className="mt-4 bg-gray-800 p-4 rounded text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default App