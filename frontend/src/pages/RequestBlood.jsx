import React, {useState} from 'react'
import api from '../services/api'

export default function RequestBlood(){
  const [form, setForm] = useState({blood_group: 'O+', units: 1})
  const [msg, setMsg] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({...prev, [name]: name === 'units' ? (value === '' ? '' : Number(value)) : value}))
  }

  const validate = () => {
    const err = {}
    if(!form.blood_group) err.blood_group = 'Select a blood group'
    if(!form.units || Number(form.units) < 1) err.units = 'Units must be at least 1'
    return err
  }

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    const v = validate()
    setErrors(v)
    if(Object.keys(v).length) return
    setIsSubmitting(true)
    try{
      await api.post('blood-requests/', { ...form, units: Number(form.units) })
      setMsg('Blood request submitted')
      setForm({blood_group: 'O+', units: 1})
      setErrors({})
    }catch(err){
      setMsg('Error: ' + JSON.stringify(err.response?.data || err.message))
    }finally{
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto" style={{maxWidth:600}}>
      <h2 className="mb-3">Request Blood</h2>
      <form onSubmit={submit} noValidate>
        <div className="mb-3">
          <label className="form-label">Blood Group</label>
          <select name="blood_group" className={`form-select ${errors.blood_group? 'is-invalid':''}`} value={form.blood_group} onChange={onChange}>
            <option>O+</option>
            <option>O-</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
          {errors.blood_group && <div className="invalid-feedback">{errors.blood_group}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Units</label>
          <input name="units" type="number" min="1" className={`form-control ${errors.units? 'is-invalid':''}`} value={form.units} onChange={onChange} />
          {errors.units && <div className="invalid-feedback">{errors.units}</div>}
        </div>
        {msg && <div className="alert alert-info">{msg}</div>}
        <button className="btn btn-warning" type="submit" disabled={isSubmitting}>{isSubmitting? 'Requesting...':'Request Blood'}</button>
      </form>
    </div>
  )
}
