import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register(){
  const navigate = useNavigate()
  const [form, setForm] = useState({username:'', email:'', password:'', confirmPassword:'', role:'donor'})
  const [msg, setMsg] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChange = (e) => setForm({...form, [e.target.name]: e.target.value})

  const validate = () => {
    const errs = {}
    if(!form.username || form.username.trim().length < 3) errs.username = 'Username must be at least 3 characters'
    if(!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if(!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if(form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    const v = validate()
    setErrors(v)
    if(Object.keys(v).length) return
    setIsSubmitting(true)
    try{
      await api.post('auth/register/', {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role
      })
      // navigate to login page
      navigate('/login', { replace: true })
    }catch(err){
      const server = err.response?.data || err.message
      setMsg('Registration failed: ' + JSON.stringify(server))
    }finally{
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto" style={{maxWidth:600}}>
      <h2 className="mb-3">Register</h2>
      <form onSubmit={submit} noValidate>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input name="username" className={`form-control ${errors.username? 'is-invalid': ''}`} value={form.username} onChange={onChange} />
          {errors.username && <div className="invalid-feedback">{errors.username}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input name="email" className={`form-control ${errors.email? 'is-invalid': ''}`} value={form.email} onChange={onChange} />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input name="password" type="password" className={`form-control ${errors.password? 'is-invalid': ''}`} value={form.password} onChange={onChange} />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input name="confirmPassword" type="password" className={`form-control ${errors.confirmPassword? 'is-invalid': ''}`} value={form.confirmPassword} onChange={onChange} />
          {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select name="role" className="form-select" onChange={onChange} value={form.role}>
            <option value="donor">Donor</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>
        {msg && <div className="alert alert-danger">{msg}</div>}
        <button className="btn btn-success" type="submit" disabled={isSubmitting}>{isSubmitting? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  )
}
