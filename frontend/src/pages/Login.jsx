import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../components/ToastContext'

export default function Login(){
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    if(!username || username.trim() === '') return 'Enter your username'
    if(!password || password.length === 0) return 'Enter your password'
    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    const v = validate()
    if(v){ setError(v); return }
    setIsSubmitting(true)
    try{
      const resp = await api.post('auth/login/', { username, password })
      const access = resp.data.access
      const refresh = resp.data.refresh
      api.setTokens({ access, refresh })

      // fetch current user to redirect based on role
      try{
        const me = await api.get('users/me/')
        const role = me.data.role
        if(role === 'admin') navigate('/admin', { replace: true })
        else navigate('/', { replace: true })
      }catch(e){
        // fallback
        navigate('/', { replace: true })
      }
      toast.success('Logged in')
    }catch(err){
      const server = err.response?.data || err.message || 'Login failed'
      const msg = typeof server === 'string' ? server : JSON.stringify(server)
      setError(msg)
      toast.error('Login failed: ' + msg)
    }finally{
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto" style={{maxWidth:480}}>
      <h2 className="mb-3">Login</h2>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input className={`form-control ${error && error.toLowerCase().includes('username')? 'is-invalid':''}`} value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className={`form-control ${error && error.toLowerCase().includes('password')? 'is-invalid':''}`} value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  )
}
