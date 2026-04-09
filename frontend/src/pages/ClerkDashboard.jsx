import { useState, useEffect } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function ClerkDashboard() {
  const [cases, setCases] = useState([])
  const [hearingForm, setHearingForm] = useState({ case_id:'', hearing_date:'', notes:'' })
  const [message, setMessage] = useState('')
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()

  useEffect(() => { fetchCases() }, [])

  async function fetchCases() {
    const res = await API.get('/cases')
    setCases(res.data)
  }

  async function updateStatus(id, status) {
    try {
      await API.patch(`/cases/${id}/status`, { status, judge_id: 2 })
      setMessage(`Case ${id} updated to ${status}`)
      fetchCases()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error updating case')
    }
  }

  async function scheduleHearing(e) {
    e.preventDefault()
    try {
      await API.post('/hearings', hearingForm)
      setMessage('Hearing scheduled successfully')
      setHearingForm({ case_id:'', hearing_date:'', notes:'' })
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error scheduling hearing')
    }
  }

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={{ fontFamily:'Arial', maxWidth:'900px', margin:'0 auto', padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <h1 style={{ color:'#1B3A6B' }}>Casehub — Clerk Dashboard</h1>
        <div>
          <span style={{ marginRight:'16px', color:'#666' }}>Welcome, {user?.name}</span>
          <button onClick={logout} style={{ padding:'8px 16px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Logout</button>
        </div>
      </div>

      {message && <div style={{ background:'#d1fae5', padding:'12px', borderRadius:'6px', marginBottom:'16px', color:'#065f46' }}>{message}</div>}

      {/* Schedule Hearing */}
      <div style={{ background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', marginBottom:'24px' }}>
        <h2 style={{ color:'#1B3A6B', marginBottom:'16px' }}>Schedule Hearing</h2>
        <form onSubmit={scheduleHearing}>
          <input placeholder="Case ID" value={hearingForm.case_id} onChange={e => setHearingForm({...hearingForm, case_id:e.target.value})}
            style={{ width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box' }} />
          <input type="datetime-local" value={hearingForm.hearing_date} onChange={e => setHearingForm({...hearingForm, hearing_date:e.target.value})}
            style={{ width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box' }} />
          <input placeholder="Notes" value={hearingForm.notes} onChange={e => setHearingForm({...hearingForm, notes:e.target.value})}
            style={{ width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box' }} />
          <button type="submit" style={{ padding:'10px 24px', background:'#1B3A6B', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>
            Schedule
          </button>
        </form>
      </div>

      {/* All Cases */}
      <div style={{ background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ color:'#1B3A6B', marginBottom:'16px' }}>All Cases</h2>
        {cases.length === 0 ? <p style={{ color:'#666' }}>No cases found.</p> :
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
              <div style={{ marginTop:'12px', display:'flex', gap:'8px' }}>
                <button onClick={() => updateStatus(c.id, 'Active')}
                  style={{ padding:'6px 14px', background:'#059669', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }}>
                  Approve
                </button>
                <button onClick={() => updateStatus(c.id, 'Rejected')}
                  style={{ padding:'6px 14px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }}>
                  Reject
                </button>
                <button onClick={() => updateStatus(c.id, 'Closed')}
                  style={{ padding:'6px 14px', background:'#6b7280', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }}>
                  Close
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}