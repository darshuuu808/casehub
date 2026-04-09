import { useState } from 'react'
import API from '../api'

export default function PublicSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    const res = await API.get(`/search?q=${query}`)
    setResults(res.data)
    setSearched(true)
  }

  return (
    <div style={{ fontFamily:'Arial', maxWidth:'800px', margin:'0 auto', padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <h1 style={{ color:'#1B3A6B' }}>Casehub — Public Case Search</h1>
        <a href="/login" style={{ color:'#2563EB' }}>Login</a>
      </div>

      <div style={{ background:'white', padding:'24px', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', marginBottom:'24px' }}>
        <form onSubmit={handleSearch} style={{ display:'flex', gap:'12px' }}>
          <input
            placeholder="Search by case title, petitioner or respondent..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex:1, padding:'10px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'15px' }}
          />
          <button type="submit"
            style={{ padding:'10px 24px', background:'#1B3A6B', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'15px' }}>
            Search
          </button>
        </form>
      </div>

      {searched && results.length === 0 && (
        <p style={{ color:'#666', textAlign:'center' }}>No cases found for "{query}"</p>
      )}

      {results.map(c => (
        <div key={c.id} style={{ background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', marginBottom:'12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <h3 style={{ margin:'0 0 4px', color:'#1B3A6B' }}>#{c.id} — {c.title}</h3>
              <p style={{ margin:'0', color:'#666', fontSize:'14px' }}>{c.petitioner} vs {c.respondent}</p>
              <p style={{ margin:'4px 0 0', color:'#999', fontSize:'13px' }}>
                Filed: {new Date(c.filed_date).toLocaleDateString()}
              </p>
            </div>
            <span style={{ padding:'4px 12px',
              background: c.status === 'Pending' ? '#fef3c7' : c.status === 'Active' ? '#d1fae5' : '#fee2e2',
              color: c.status === 'Pending' ? '#92400e' : c.status === 'Active' ? '#065f46' : '#991b1b',
              borderRadius:'20px', fontSize:'13px' }}>
              {c.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}