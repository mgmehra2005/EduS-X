import React from 'react'
import { Link } from 'react-router-dom'

export default function Solution() {
  const raw = sessionStorage.getItem('resolved_solution')
  const payload = raw ? JSON.parse(raw) : null
  const resolved = payload ? (payload.resolved_solution || payload) : null
  const aiData = resolved ? (typeof resolved.data === 'string' ? JSON.parse(resolved.data) : resolved.data) : null

  if (!aiData) {
    return (
      <div>
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="logo"><img src="/static/resources/images/logo.svg" alt="Eduba Logo"/></div>
          </div>
        </header>
        <main>
          <p>No solution found. Return to <Link to="/">home</Link>.</p>
        </main>
        <footer>
          <p>© 2025 Eduba</p>
        </footer>
      </div>
    )
  }

  return (
    <div>
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="logo"><img src="/static/resources/images/logo.svg" alt="Eduba Logo"/></div>
          <div>
            <Link to="/">← Back Home</Link>
          </div>
        </div>
      </header>
      <main>
        <h1>Solution Details</h1>
        <div className="panes">
          <section className="pane">
            <div id="problemStatementBox">
              <h3>Problem Statement</h3>
              <p id="userProblemStatement" style={{ lineHeight: '1.6', color: '#333' }}>
                {aiData.user_query || '—'}
              </p>
            </div>
          </section>

          <section className="pane" style={{ gridColumn: 'span 1' }}>
            <div id="solutionCon" className="solution">
              <h3>Solution</h3>
              <div 
                className="solution-text"
                style={{
                  backgroundColor: '#f9f9f9',
                  padding: '12px',
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}
              >
                {aiData.final_answer || 'No solution provided'}
              </div>
              <div id="explainationCon" className="solution" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <h3>Explanation</h3>
                <div className="explaination-text" style={{ lineHeight: '1.8' }}>
                  {Array.isArray(aiData.stepwise_explanation) ? (
                    <ol style={{ paddingLeft: '20px' }}>
                      {aiData.stepwise_explanation.map((s, i) => (
                        <li key={i} style={{ marginBottom: '8px' }}>
                          {s}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>{aiData.stepwise_explanation || 'No explanation provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="pane">
            <div className="description">
              <h3>Concept</h3>
              <p id="concept_title" style={{ color: '#555' }}>
                {aiData.concept || '—'}
              </p>
            </div>
            <div className="description" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <h3>Difficulty Level</h3>
              <p id="difficulty-level" style={{ color: '#555' }}>
                {aiData.difficulty || '—'}
              </p>
            </div>
            {aiData.related_concepts && (
              <div className="description" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <h3>Related Concepts</h3>
                <ul style={{ paddingLeft: '20px' }}>
                  {(Array.isArray(aiData.related_concepts) ? aiData.related_concepts : [aiData.related_concepts]).map((concept, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{concept}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>
      <footer>
        <p>© 2025 Eduba - Personalized Learning Solutions</p>
      </footer>
    </div>
  )
}
