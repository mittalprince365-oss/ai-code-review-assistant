import { useState } from 'react'

function Review({ session }) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [copied, setCopied] = useState(false)
  const [docs, setDocs] = useState(null)
  const [docsLoading, setDocsLoading] = useState(false)
  const [docsCopied, setDocsCopied] = useState(false)

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
    if (code.length > 50000) {
      setResult({ error: 'Code is too large (max 50KB). Please review a smaller file.' })
      return
    }
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

  const copyImprovedCode = () => {
    navigator.clipboard.writeText(ai.improved_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const handleGenerateDocs = async () => {
    setDocsLoading(true)
    setDocs(null)
    try {
      const res = await fetch('http://localhost:5000/api/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code, language }),
      })
      const data = await res.json()
      setDocs(data)
    } catch {
      setDocs({ error: 'Could not reach the server.' })
    }
    setDocsLoading(false)
  }

  const copyDocs = () => {
    navigator.clipboard.writeText(docs.documented_code)
    setDocsCopied(true)
    setTimeout(() => setDocsCopied(false), 2000)
  }

  const sa = result?.static_analysis
  const ai = result?.ai_review

  const complexityColor = {
    low: 'bg-green-900 text-green-300 border-green-700',
    medium: 'bg-yellow-900 text-yellow-300 border-yellow-700',
    high: 'bg-red-900 text-red-300 border-red-700',
  }

  const typeEmoji = {
    bug: '🐛',
    'code-smell': '👃',
    performance: '⚡',
    naming: '🏷️',
    'best-practice': '📘',
  }

  const aiSeverityColor = {
    high: 'bg-red-900 text-red-300',
    medium: 'bg-yellow-900 text-yellow-300',
    low: 'bg-blue-900 text-blue-300',
  }

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
        disabled={loading || !code.trim()}
        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium disabled:opacity-50"
      >
        {loading ? '🤖 AI is reviewing your code...' : 'Review Code'}
      </button>
      <button
        onClick={handleGenerateDocs}
        disabled={docsLoading || !code.trim()}
        className="mt-3 ml-3 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded font-medium disabled:opacity-50"
      >
        {docsLoading ? '📝 Generating docs...' : '📝 Generate Docs'}
      </button>

      {docs?.error && (
        <div className="mt-4 bg-red-900/40 border border-red-700 text-red-300 p-4 rounded">
          ⚠️ {docs.error}
        </div>
      )}

      {docs?.documented_code && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-white mb-3">
            📝 Generated Documentation
          </h2>
          <div className="bg-gray-800 border border-purple-900 rounded-lg p-4 mb-3">
            <p className="text-gray-300">{docs.overview}</p>
          </div>
          <div className="bg-gray-800 border border-purple-900 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-900">
              <span className="text-white font-semibold">Documented Code</span>
              <button
                onClick={copyDocs}
                className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
              >
                {docsCopied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <pre className="p-4 text-sm text-purple-200 font-mono overflow-auto">
              {docs.documented_code}
            </pre>
          </div>
        </div>
      )}

      {result?.error && (
        <div className="mt-4 bg-red-900/40 border border-red-700 text-red-300 p-4 rounded">
          ⚠️ {result.error}
        </div>
      )}

      {/* ===== STAGE 1: STATIC ANALYSIS ===== */}
      {sa && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-white mb-3">
            🔍 Stage 1: Static Analysis
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
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

          {sa.total_issues === 0 && (
            <div className="bg-green-900/30 border border-green-700 text-green-300 p-4 rounded-lg text-center mb-4">
              ✅ No static analysis issues found!
            </div>
          )}

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

      {/* ===== STAGE 2: AI REVIEW ===== */}
      {ai && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-3">
            🤖 Stage 2: AI Review
          </h2>

          {/* SUMMARY CARD */}
          <div className="bg-gray-800 border border-blue-900 rounded-lg p-5 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-white font-semibold">AI Summary</span>
              {ai.complexity && (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded uppercase border ${
                    complexityColor[ai.complexity] ||
                    'bg-gray-900 text-gray-300 border-gray-700'
                  }`}
                >
                  Complexity: {ai.complexity}
                </span>
              )}
            </div>
            <p className="text-gray-300">{ai.summary}</p>
          </div>

          {/* AI ISSUE CARDS */}
          <div className="space-y-3 mb-4">
            {ai.issues?.map((issue, i) => (
              <div
                key={i}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-lg">
                    {typeEmoji[issue.type] || '💡'}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                      aiSeverityColor[issue.severity] ||
                      'bg-gray-900 text-gray-300'
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <span className="text-gray-400 text-xs bg-gray-900 px-2 py-1 rounded">
                    {issue.type}
                  </span>
                  {issue.line && (
                    <span className="text-gray-400 text-sm">
                      Line {issue.line}
                    </span>
                  )}
                </div>
                <p className="text-white mb-1">{issue.description}</p>
                <p className="text-green-400 text-sm">
                  💡 {issue.suggestion}
                </p>
              </div>
            ))}
          </div>

          {/* IMPROVED CODE */}
          {ai.improved_code && (
            <div className="bg-gray-800 border border-green-900 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-4 py-3 bg-gray-900">
                <span className="text-white font-semibold">
                  ✨ Improved Code
                </span>
                <button
                  onClick={copyImprovedCode}
                  className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <pre className="p-4 text-sm text-green-300 font-mono overflow-auto">
                {ai.improved_code}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Review