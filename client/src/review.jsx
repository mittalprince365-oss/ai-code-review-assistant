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

  const sa = result?.static_analysis

  return (
    <div className="p-8 max-w-5xl mx-auto">
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
        {loading ? '⏳ Analyzing...' : 'Review Code'}
      </button>

      {/* ERROR BOX */}
      {result?.error && (
        <div className="mt-4 bg-red-900/40 border border-red-700 text-red-300 p-4 rounded">
          ⚠️ {result.error}
        </div>
      )}

      {/* RESULTS DASHBOARD */}
      {sa && (
        <div className="mt-6">
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-white">{sa.total_issues}</p>
              <p className="text-gray-400 text-sm mt-1">Total Issues</p>
            </div>
            <div className="bg-gray-800 border border-red-900 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{sa.errors}</p>
              <p className="text-gray-400 text-sm mt-1">Errors</p>
            </div>
            <div className="bg-gray-800 border border-yellow-900 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{sa.warnings}</p>
              <p className="text-gray-400 text-sm mt-1">Warnings</p>
            </div>
          </div>

          {/* SAB SAHI HAI WALA MESSAGE */}
          {sa.total_issues === 0 && (
            <div className="bg-green-900/30 border border-green-700 text-green-300 p-6 rounded-lg text-center">
              ✅ No issues found — clean code!
            </div>
          )}

          {/* ISSUE CARDS */}
          <div className="space-y-3">
            {sa.issues.map((issue, i) => (
              <div
                key={i}
                className={`bg-gray-800 border rounded-lg p-4 ${
                  issue.severity === 'error'
                    ? 'border-red-800'
                    : 'border-yellow-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                      issue.severity === 'error'
                        ? 'bg-red-900 text-red-300'
                        : 'bg-yellow-900 text-yellow-300'
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <span className="text-gray-400 text-sm">
                    Line {issue.line}, Column {issue.column}
                  </span>
                  {issue.rule && (
                    <span className="text-gray-500 text-xs bg-gray-900 px-2 py-1 rounded">
                      {issue.rule}
                    </span>
                  )}
                </div>
                <p className="text-white">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Review