import { useState, useEffect } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function LawyerDashboard() {
  const [cases, setCases] = useState([])
  const [form, setForm] = useState({ title:'', description:'', petitioner:'', respondent:'' })
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()

  useEffect(() => { fetchCases() }, [])

  async function fetchCases() {
    const res = await API.get('/cases')
    setCases(res.data)
  }

  async function fileCase(e) {
    e.preventDefault()
    try {
      await API.post('/cases', form)
      setMessage('Case filed successfully')
      setForm({ title:'', description:'', petitioner:'', respondent:'' })
      fetchCases()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error filing case')
    }
  }

  async function uploadDoc(caseId) {
    if (!file) return alert('Select a file first')
    const formData = new FormData()
    formData.append('document', file)
    try {
      const res = await API.post(`/cases/${caseId}/documents`, formData)
      setMessage('Document uploaded: ' + res.data.url)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Upload failed')
    }
  }

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={{ fontFamily:'Arial', maxWidth:'900px', margin:'0 auto', padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <h1 style={{ color:'#1B3A6B' }}>Casehub — Lawyer Dashboard</h1>
        <div>
          <span style={{ marginRight:'16px', color:'#666' }}>Welcome, {user?.name}</span>
          <button onClick={logout} style={{ padding:'8px 16px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Logout</button>
        </div>
      </div>

      {message && <div style={{ background:'#d1fae5', padding:'12px', borderRadius:'6px', marginBottom:'16px', color:'#065f46' }}>{message}</div>}

      {/* File New Case */}
      <div style={{ background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', marginBottom:'24px' }}>
        <h2 style={{ color:'#1B3A6B', marginBottom:'16px' }}>File New Case</h2>
        <form onSubmit={fileCase}>
          <input placeholder="Case Title" value={form.title} onChange={e => setForm({...form, title:e.target.value})}
            style={{ width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box' }} />
          <input placeholder="Petitioner Name" value={form.petitioner} onChange={e => setForm({...form, petitioner:e.target.value})}
            style={{ width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box' }} />
          <input placeholder="Respondent Name" value={form.respondent} onChange={e => setForm({...form, respondent:e.target.value})}
            style={{ width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box' }} />
          <textarea placeholder="Case Description" value={form.description} onChange={e => setForm({...form, description:e.target.value})}
            style={{ width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box', height:'80px' }} />
          <button type="submit" style={{ padding:'10px 24px', background:'#1B3A6B', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>
            File Case
          </button>
        </form>
      </div>

      {/* My Cases */}
      <div style={{ background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ color:'#1B3A6B', marginBottom:'16px' }}>My Cases</h2>
        {cases.length === 0 ? <p style={{ color:'#666' }}>No cases filed yet.</p> :
          cases.map(c => (
            <div key={c.id} style={{ border:'1px solid #e5e7eb', borderRadius:'8px', padding:'16px', marginBottom:'12px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <h3 style={{ margin:'0 0 4px', color:'#1B3A6B' }}>{c.title}</h3>
                  <p style={{ margin:'0', color:'#666', fontSize:'14px' }}>{c.petitioner} vs {c.respondent}</p>
                </div>
                <span style={{ padding:'4px 12px', background: c.status === 'Pending' ? '#fef3c7' : '#d1fae5',
                  color: c.status === 'Pending' ? '#92400e' : '#065f46', borderRadius:'20px', fontSize:'13px' }}>
                  {c.status}
                </span>
              </div>
              <div style={{ marginTop:'12px', display:'flex', gap:'8px', alignItems:'center' }}>
                <input type="file" onChange={e => setFile(e.target.files[0])}
                  style={{ fontSize:'13px' }} />
                <button onClick={() => uploadDoc(c.id)}
                  style={{ padding:'6px 14px', background:'#2563EB', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }}>
                  Upload Doc
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}