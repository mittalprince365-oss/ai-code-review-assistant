import { useState } from 'react'

function Review({ session }) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFileName(file.name)

    // file ke naam se language khud pehchan lo
    if (file.name.endsWith('.py')) setLanguage('python')
    if (file.name.endsWith('.js') || file.name.endsWith('.jsx'))
      setLanguage('javascript')

    const reader = new FileReader()
    reader.onload = (event) => setCode(event.target.result)
    reader.readAsText(file)
  }

  const handleReview = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('http://localhost:5000/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code, language }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({
        error: 'Could not reach the server. Make sure the backend is running.',
      })
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-4">Review Your Code</h1>

      <div className="flex gap-3 mb-3 items-center">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>

        <label className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm cursor-pointer">
          📁 Upload File
          <input
            type="file"
            accept=".js,.jsx,.py,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {fileName && (
          <span className="text-gray-400 text-sm">Loaded: {fileName}</span>
        )}
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here or upload a file..."
        className="w-full h-48 bg-gray-800 text-white border border-gray-700 rounded p-3 font-mono text-sm"
      />

      <button
        onClick={handleReview}
        disabled={loading}
        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : 'Review Code'}
      </button>

      {result && (
        <pre className="mt-4 bg-gray-800 text-white p-4 rounded text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )}

export default Review