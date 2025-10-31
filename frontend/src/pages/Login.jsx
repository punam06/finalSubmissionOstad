import React, {useState} from 'react'
import api from '../services/api'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    try{
      const resp = await api.post('auth/login/', { username, password })
      const access = resp.data.access
      const refresh = resp.data.refresh
      api.setTokens({ access, refresh })
      window.location.href = '/'
    }catch(err){
      setError(err.response?.data || 'Login failed')
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input className="form-control" value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <div className="alert alert-danger">{JSON.stringify(error)}</div>}
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
    </div>
  )
}
