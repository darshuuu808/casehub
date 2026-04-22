import { useState, useEffect } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function JudgeDashboard() {
  const [cases, setCases] = useState([])
  const [hearings, setHearings] = useState({})
  const [summaries, setSummaries] = useState({})
  const [loadingSummary, setLoadingSummary] = useState({})
  const [message, setMessage] = useState('')
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()

  useEffect(() => { fetchCases() }, [])

  async function fetchCases() {
    const res = await API.get('/cases')
    setCases(res.data)
  }

  async function fetchHearings(caseId) {
    const res = await API.get(`/hearings/case/${caseId}`)
    setHearings(prev => ({ ...prev, [caseId]: res.data }))
  }

  async function generateSummary(caseId) {
    setLoadingSummary(prev => ({ ...prev, [caseId]: true }))
    try {
      const res = await API.post(`/ai/summarize/${caseId}`)
      setSummaries(prev => ({ ...prev, [caseId]: res.data.summary }))
    } catch (err) {
      setMessage('Failed to generate summary')
    }
    setLoadingSummary(prev => ({ ...prev, [caseId]: false }))
  }

  async function updateHearing(hearingId, status, judgment) {
    try {
      await API.patch(`/hearings/${hearingId}`, { status, judgment })
      setMessage('Hearing updated successfully')
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error updating hearing')
    }
  }

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={{ fontFamily:'Arial', maxWidth:'900px', margin:'0 auto', padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <h1 style={{ color:'#1B3A6B' }}>Casehub — Judge Dashboard</h1>
        <div>
          <span style={{ marginRight:'16px', color:'#666' }}>Welcome, {user?.name}</span>
          <button onClick={logout} style={{ padding:'8px 16px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Logout</button>
        </div>
      </div>

      {message && <div style={{ background:'#d1fae5', padding:'12px', borderRadius:'6px', marginBottom:'16px', color:'#065f46' }}>{message}</div>}

      <div style={{ background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ color:'#1B3A6B', marginBottom:'16px' }}>Assigned Cases</h2>
        {cases.length === 0 ? <p style={{ color:'#666' }}>No cases assigned yet.</p> :
          cases.map(c => (
            <div key={c.id} style={{ border:'1px solid #e5e7eb', borderRadius:'8px', padding:'16px', marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <h3 style={{ margin:'0 0 4px', color:'#1B3A6B' }}>#{c.id} — {c.title}</h3>
                  <p style={{ margin:'0', color:'#666', fontSize:'14px' }}>{c.petitioner} vs {c.respondent}</p>
                </div>
                <span style={{ padding:'4px 12px', background: c.status === 'Pending' ? '#fef3c7' : '#d1fae5',
                  color: c.status === 'Pending' ? '#92400e' : '#065f46', borderRadius:'20px', fontSize:'13px' }}>
                  {c.status}
                </span>
              </div>

              {/* AI Summary Button */}
              <div style={{ marginTop:'12px', display:'flex', gap:'8px' }}>
                <button onClick={() => fetchHearings(c.id)}
                  style={{ padding:'6px 14px', background:'#2563EB', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }}>
                  View Hearings
                </button>
                <button onClick={() => generateSummary(c.id)}
                  disabled={loadingSummary[c.id]}
                  style={{ padding:'6px 14px', background:'#7c3aed', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }}>
                  {loadingSummary[c.id] ? 'Generating...' : '✨ AI Summary'}
                </button>
              </div>

              {/* AI Summary Output */}
              {summaries[c.id] && (
                <div style={{ marginTop:'12px', background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:'8px', padding:'16px' }}>
                  <h4 style={{ margin:'0 0 8px', color:'#7c3aed' }}>✨ AI Case Summary</h4>
                  <p style={{ margin:'0', fontSize:'14px', color:'#374151', whiteSpace:'pre-wrap', lineHeight:'1.6' }}>{summaries[c.id]}</p>
                </div>
              )}

              {hearings[c.id] && (
                <div style={{ marginTop:'12px' }}>
                  {hearings[c.id].length === 0 ? <p style={{ color:'#666', fontSize:'14px' }}>No hearings scheduled.</p> :
                    hearings[c.id].map(h => (
                      <div key={h.id} style={{ background:'#f8fafc', borderRadius:'6px', padding:'12px', marginBottom:'8px' }}>
                        <p style={{ margin:'0 0 4px', fontSize:'14px' }}><strong>Date:</strong> {new Date(h.hearing_date).toLocaleString()}</p>
                        <p style={{ margin:'0 0 8px', fontSize:'14px' }}><strong>Status:</strong> {h.status}</p>
                        <div style={{ display:'flex', gap:'8px' }}>
                          <button onClick={() => updateHearing(h.id, 'Completed', 'Judgment recorded')}
                            style={{ padding:'6px 12px', background:'#059669', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }}>
                            Mark Complete
                          </button>
                          <button onClick={() => updateHearing(h.id, 'Adjourned', '')}
                            style={{ padding:'6px 12px', background:'#f59e0b', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }}>
                            Adjourn
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  )
}