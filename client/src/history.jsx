import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function History() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('all')
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setReviews(data)
      setLoading(false)
    }
    fetchReviews()
  }, [])

  // search + filter apply karo
  const filtered = reviews.filter((r) => {
    const matchesSearch = r.code_snippet
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesLang = langFilter === 'all' || r.language === langFilter
    return matchesSearch && matchesLang
  })

  const formatDate = (d) =>
    new Date(d).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400">Loading your reviews...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">Review History</h1>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="🔍 Search in code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm"
        />
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm"
        >
          <option value="all">All Languages</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      {/* KHALI STATE */}
      {filtered.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg">📂 No reviews found</p>
          <p className="text-gray-500 text-sm mt-2">
            {reviews.length === 0
              ? 'Go to the Review page and analyze some code first.'
              : 'Try changing your search or filter.'}
          </p>
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-3">
        {filtered.map((r) => {
          const sa = r.results?.static_analysis
          const ai = r.results?.ai_review
          const isOpen = openId === r.id

          return (
            <div
              key={r.id}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
            >
              {/* CARD HEADER - click karke kholo/band karo */}
              <div
                onClick={() => setOpenId(isOpen ? null : r.id)}
                className="p-4 cursor-pointer hover:bg-gray-750 flex justify-between items-center"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-gray-400 text-xs bg-gray-900 px-2 py-1 rounded uppercase">
                    {r.language}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {formatDate(r.created_at)}
                  </span>
                  {sa && (
                    <>
                      <span className="text-red-400 text-sm">
                        {sa.errors} errors
                      </span>
                      <span className="text-yellow-400 text-sm">
                        {sa.warnings} warnings
                      </span>
                    </>
                  )}
                </div>
                <span className="text-gray-500">{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* CARD BODY - details */}
              {isOpen && (
                <div className="border-t border-gray-700 p-4 space-y-4">
                  {/* CODE */}
                  <div>
                    <p className="text-gray-400 text-sm mb-2 font-semibold">
                      Code:
                    </p>
                    <pre className="bg-gray-900 p-3 rounded text-sm text-gray-300 font-mono overflow-auto max-h-48">
                      {r.code_snippet}
                    </pre>
                  </div>

                  {/* AI SUMMARY */}
                  {ai?.summary && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2 font-semibold">
                        🤖 AI Summary:
                      </p>
                      <p className="text-gray-300 text-sm bg-gray-900 p-3 rounded">
                        {ai.summary}
                      </p>
                    </div>
                  )}

                  {/* STATIC ISSUES */}
                  {sa?.issues?.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2 font-semibold">
                        🔍 Static Analysis Issues:
                      </p>
                      <div className="space-y-2">
                        {sa.issues.map((issue, i) => (
                          <p key={i} className="text-sm text-gray-300">
                            <span
                              className={
                                issue.severity === 'error'
                                  ? 'text-red-400'
                                  : 'text-yellow-400'
                              }
                            >
                              [{issue.severity}]
                            </span>{' '}
                            Line {issue.line}: {issue.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI ISSUES */}
                  {ai?.issues?.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2 font-semibold">
                        🤖 AI Issues:
                      </p>
                      <div className="space-y-2">
                        {ai.issues.map((issue, i) => (
                          <p key={i} className="text-sm text-gray-300">
                            <span className="text-blue-400">
                              [{issue.severity}]
                            </span>{' '}
                            {issue.description} —{' '}
                            <span className="text-green-400">
                              {issue.suggestion}
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default History