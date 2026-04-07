import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Solution() {
  const raw = sessionStorage.getItem('resolved_solution')
  const payload = raw ? JSON.parse(raw) : null
  const resolved = payload ? (payload.resolved_solution || payload) : null
  const aiData = resolved ? (typeof resolved.data === 'string' ? JSON.parse(resolved.data) : resolved.data) : null

  const navigate = useNavigate()
  const [sendDisabled, setSendDisabled] = useState(false)

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

            <div className="mt-4 flex flex-col gap-3">
              <Link to="/" className="text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded">Solve more questions</Link>
              <Link to="/live-doubt" className="text-center bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded">live doubt solving</Link>
            </div>
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

          {/* Right-pane action button */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="bg-white/5 border border-white/6 rounded p-4">
              <h3 className="text-lg font-semibold mb-2">Special Actions</h3>
              <p className="text-white/80 mb-4 text-sm"> </p>
              <button
                onClick={async () => {
                  if (sendDisabled) return
                  setSendDisabled(true)
                  try {
                    await fetch('http://192.168.1.33:8000/api/v1/process', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ explanation: aiData, concept_difficulty_level: `${aiData.concept || 'unknown'}_${aiData.difficulty || 'unknown'}`, final_answer: aiData.final_answer || 'N/A' })
                    })
                  } catch (err) {
                    console.error('Error sending data', err)
                  }
                  setTimeout(() => {
                    setSendDisabled(false)
                    navigate('/home')
                  }, 5000)
                }}
                disabled={sendDisabled}
                className={`w-full text-center py-2 px-3 rounded ${sendDisabled ? 'bg-gray-500 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
              >
                {sendDisabled ? 'Sending...' : 'Visualize Solution'}
              </button>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-white/6">
        <div className="container mx-auto px-6 py-6 text-center text-white/60">© 2025 Eduba - Personalized Learning Solutions</div>
      </footer>
    </div>
  )
}
