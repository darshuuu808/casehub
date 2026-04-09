import { useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    try {
      const res = await API.post('/users/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      const role = res.data.user.role
      if (role === 'lawyer') navigate('/lawyer')
      else if (role === 'clerk') navigate('/clerk')
      else if (role === 'judge') navigate('/judge')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f0f4ff' }}>
      <div style={{ background:'white', padding:'40px', borderRadius:'12px', width:'360px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color:'#1B3A6B', marginBottom:'8px' }}>Casehub</h1>
        <p style={{ color:'#666', marginBottom:'24px' }}>Court Case Management System</p>
        {error && <p style={{ color:'red', marginBottom:'16px' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width:'100%', padding:'10px', marginBottom:'12px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box' }}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width:'100%', padding:'10px', marginBottom:'16px', borderRadius:'6px', border:'1px solid #ddd', boxSizing:'border-box' }}
          />
          <button type="submit"
            style={{ width:'100%', padding:'12px', background:'#1B3A6B', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'16px' }}>
            Login
          </button>
        </form>
        <p style={{ marginTop:'16px', textAlign:'center' }}>
          <a href="/search" style={{ color:'#2563EB' }}>Search Cases (Public)</a>
        </p>
      </div>
    </div>
  )
}