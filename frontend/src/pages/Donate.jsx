import React, {useState} from 'react'
import api from '../services/api'

export default function Donate(){
  const [form, setForm] = useState({blood_bank: '', blood_group: 'O+', units: 1})
  const [msg, setMsg] = useState(null)

  const onChange = (e) => setForm({...form, [e.target.name]: e.target.value})

  const submit = async (e) => {
    e.preventDefault()
    try{
      await api.post('donations/', form)
      setMsg('Donation request created')
    }catch(err){
      setMsg('Error: ' + JSON.stringify(err.response?.data || err.message))
    }
  }

  return (
    <div>
      <h2>Make a Donation</h2>
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Blood Bank (id)</label>
          <input name="blood_bank" className="form-control" onChange={onChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">Blood Group</label>
          <select name="blood_group" className="form-select" value={form.blood_group} onChange={onChange}>
            <option>O+</option>
            <option>O-</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Units</label>
          <input name="units" type="number" min="1" className="form-control" value={form.units} onChange={onChange} />
        </div>
        {msg && <div className="alert alert-info">{msg}</div>}
        <button className="btn btn-primary" type="submit">Submit Donation</button>
      </form>
    </div>
  )
}
