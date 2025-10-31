import React, {useState} from 'react'
import api from '../services/api'

export default function Register(){
  const [form, setForm] = useState({username:'', email:'', password:'', role:'donor'})
  const [msg, setMsg] = useState(null)

  const onChange = (e) => setForm({...form, [e.target.name]: e.target.value})

  const submit = async (e) => {
    e.preventDefault()
    try{
      await api.post('auth/register/', form)
      setMsg('Registered. You can now login.')
    }catch(err){
      setMsg('Registration failed: ' + JSON.stringify(err.response?.data))
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input name="username" className="form-control" onChange={onChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" className="form-control" onChange={onChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input name="password" type="password" className="form-control" onChange={onChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select name="role" className="form-select" onChange={onChange} value={form.role}>
            <option value="donor">Donor</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>
        {msg && <div className="alert alert-info">{msg}</div>}
        <button className="btn btn-success" type="submit">Register</button>
      </form>
    </div>
  )
}
