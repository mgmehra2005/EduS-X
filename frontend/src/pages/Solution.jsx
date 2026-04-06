import React from 'react'
import { Link } from 'react-router-dom'

export default function Solution() {
  const raw = sessionStorage.getItem('resolved_solution')
  const payload = raw ? JSON.parse(raw) : null
  const resolved = payload ? (payload.resolved_solution || payload) : null
  const aiData = resolved ? (typeof resolved.data === 'string' ? JSON.parse(resolved.data) : resolved.data) : null

  if (!aiData) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <header className="border-b border-white/6">
          <div className="container mx-auto px-6 py-4 flex items-center">
            <img src="/static/resources/images/logo.svg" alt="Eduba Logo" className="h-10" />
          </div>
        </header>
        <main className="container mx-auto px-6 py-12 text-center">
          <p className="text-white/70">No solution found. Return to <Link to="/" className="underline">home</Link>.</p>
        </main>
        <footer className="border-t border-white/6">
          <div className="container mx-auto px-6 py-6 text-center text-white/60">© 2025 Eduba</div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <header className="border-b border-white/6">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/static/resources/images/logo.svg" alt="Eduba Logo" className="h-10" />
            <span className="text-lg font-semibold">EduS-X</span>
          </div>
          <div>
            <Link to="/home" className="text-sm text-white/80 hover:underline">← Back Home</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-6">Solution Details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Problem Statement */}
          <aside className="lg:col-span-3 bg-white/5 border border-white/6 rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Problem Statement</h3>
            <p className="text-white/80 whitespace-pre-wrap">{aiData.user_query || '—'}</p>
          </aside>

          {/* Center column - Solution & Explanation */}
          <section className="lg:col-span-6 bg-white/5 border border-white/6 rounded p-4">
            <h3 className="text-lg font-semibold mb-3">Solution</h3>
            <div className="bg-white/6 p-4 rounded mb-4 font-mono text-sm whitespace-pre-wrap">{aiData.final_answer || 'No solution provided'}</div>

            <div className="pt-4 border-t border-white/6">
              <h4 className="text-md font-semibold mb-2">Explanation</h4>
              <div className="text-white/80 leading-relaxed">
                {Array.isArray(aiData.stepwise_explanation) ? (
                  <ol className="list-decimal list-inside space-y-2">
                    {aiData.stepwise_explanation.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                ) : (
                  <p>{aiData.stepwise_explanation || 'No explanation provided'}</p>
                )}
              </div>
            </div>
          </section>

          {/* Right column - Metadata */}
          <aside className="lg:col-span-3 bg-white/5 border border-white/6 rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Concept</h3>
            <p className="text-white/80 mb-4">{aiData.concept || '—'}</p>

            <h3 className="text-lg font-semibold mb-2">Difficulty</h3>
            <p className="text-white/80 mb-4">{aiData.difficulty || '—'}</p>

            {aiData.related_concepts && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Related Concepts</h3>
                <ul className="list-disc list-inside text-white/80 space-y-1">
                  {(Array.isArray(aiData.related_concepts) ? aiData.related_concepts : [aiData.related_concepts]).map((concept, i) => (
                    <li key={i}>{concept}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer className="border-t border-white/6">
        <div className="container mx-auto px-6 py-6 text-center text-white/60">© 2025 Eduba - Personalized Learning Solutions</div>
      </footer>
    </div>
  )
}
