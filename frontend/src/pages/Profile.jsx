import React, {useEffect, useState} from 'react'
import api from '../services/api'

export default function Profile(){
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({phone:'', blood_group:'O+', city:'', available:true})
  const [photo, setPhoto] = useState(null)
  const [msg, setMsg] = useState(null)

  useEffect(()=>{
    api.loadToken()
    ;(async ()=>{
      try{
        const resp = await api.get('donor-profiles/')
        const p = resp.data[0]
        if(p){
          setProfile(p)
          setForm({phone: p.phone || '', blood_group: p.blood_group || 'O+', city: p.city || '', available: p.available})
        }
      }catch(err){
        // ignore
      }
    })()
  },[])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}))
  }

  const onFile = (e) => setPhoto(e.target.files[0])

  const submit = async (e) => {
    e.preventDefault()
    try{
      const data = new FormData()
      Object.keys(form).forEach(k => data.append(k, form[k]))
      if(photo) data.append('photo', photo)

      if(profile){
        const resp = await api.patch(`donor-profiles/${profile.id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
        setMsg('Profile updated')
        setProfile(resp.data)
      } else {
        const resp = await api.post('donor-profiles/', data, { headers: { 'Content-Type': 'multipart/form-data' }})
        setMsg('Profile created')
        setProfile(resp.data)
      }
    }catch(err){
      setMsg('Error: ' + JSON.stringify(err.response?.data || err.message))
    }
  }

  return (
    <div>
      <h2>My Profile</h2>
      {profile && profile.photo_url && (
        <div className="mb-3">
          <img src={profile.photo_url} alt="profile" style={{maxWidth:150, borderRadius:8}} />
        </div>
      )}

      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} className="form-control" />
        </div>
        <div className="mb-3">
          <label className="form-label">Blood Group</label>
          <select name="blood_group" value={form.blood_group} onChange={onChange} className="form-select">
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
          <label className="form-label">City</label>
          <input name="city" value={form.city} onChange={onChange} className="form-control" />
        </div>
        <div className="mb-3 form-check">
          <input name="available" checked={form.available} onChange={onChange} type="checkbox" className="form-check-input" id="available" />
          <label className="form-check-label" htmlFor="available">Available to donate</label>
        </div>
        <div className="mb-3">
          <label className="form-label">Profile photo</label>
          <input type="file" accept="image/*" onChange={onFile} className="form-control" />
        </div>
        {msg && <div className="alert alert-info">{msg}</div>}
        <button className="btn btn-primary" type="submit">Save Profile</button>
      </form>
    </div>
  )
}
