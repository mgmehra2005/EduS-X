import React from 'react'

export default function Solution() {
  const raw = sessionStorage.getItem('resolved_solution')
  const payload = raw ? JSON.parse(raw) : null
  const resolved = payload ? (payload.resolved_solution || payload) : null
  const aiData = resolved ? resolved.data : null

  if (!aiData) {
    return <div style={{ padding: 20 }}><p>No solution found. Return to <a href="/">home</a>.</p></div>
  }

  return (
    <div>
      <header>
        <div className="logo"><img src="/static/resources/images/logo.png" alt="Eduba Logo"/></div>
      </header>
      <main>
        <div className="panes">
          <section className="pane">
            <div id="problemStatementBox">
              <h3>Problem Statement</h3>
              <p id="userProblemStatement">{aiData.user_query || '—'}</p>
            </div>
          </section>

          <section className="center-pane pane">
            <div id="solutionCon" className="solution">
              <h3>Solution</h3>
              <div className="solution-text">{aiData.final_answer || ''}</div>
            </div>
            <div id="explainationCon" className="solution">
              <h3>Explanation</h3>
              <div className="explaination-text">
                {Array.isArray(aiData.stepwise_explanation) ? (
                  <ol>{aiData.stepwise_explanation.map((s, i) => <li key={i}>{s}</li>)}</ol>
                ) : (
                  <p>{aiData.stepwise_explanation || ''}</p>
                )}
              </div>
            </div>
          </section>

          <section className="pane">
            <div className="description">
              <h3>Concept</h3>
              <p id="concept_title">{aiData.concept || '—'}</p>
            </div>
            <div className="description">
              <h3>Difficulty Level</h3>
              <p id="difficulty-level">{aiData.difficulty || '—'}</p>
            </div>
          </section>
        </div>
      </main>
      <footer>
        <p>© 2025 Eduba</p>
      </footer>
    </div>
  )
}
