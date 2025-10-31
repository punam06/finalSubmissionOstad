import React, {useEffect, useState, useRef} from 'react'
import api from '../services/api'

export default function Profile(){
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({phone:'', blood_group:'O+', city:'', available:true})
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [msg, setMsg] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileRef = useRef()

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

  const onFile = (e) => {
    const f = e.target.files[0]
    setPhoto(f)
    if(f){
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const validate = () => {
    const err = {}
    if(form.phone && !/^\+?[0-9\- ]{7,20}$/.test(form.phone)) err.phone = 'Enter a valid phone number'
    if(form.city && form.city.trim().length < 2) err.city = 'City must be at least 2 characters'
    if(photo && photo.size > 2 * 1024 * 1024) err.photo = 'Image must be smaller than 2MB'
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
      setErrors({})
    }catch(err){
      setMsg('Error: ' + JSON.stringify(err.response?.data || err.message))
    }finally{
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto" style={{maxWidth:720}}>
      <h2 className="mb-3">My Profile</h2>
      {preview && (
        <div className="mb-3">
          <img src={preview} alt="preview" style={{maxWidth:150, borderRadius:8}} />
        </div>
      )}
      {(!preview && profile && profile.photo_url) && (
        <div className="mb-3">
          <img src={profile.photo_url} alt="profile" style={{maxWidth:150, borderRadius:8}} />
        </div>
      )}

      <form onSubmit={submit} encType="multipart/form-data" noValidate>
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} className={`form-control ${errors.phone? 'is-invalid':''}`} />
          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
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
          <input name="city" value={form.city} onChange={onChange} className={`form-control ${errors.city? 'is-invalid':''}`} />
          {errors.city && <div className="invalid-feedback">{errors.city}</div>}
        </div>
        <div className="mb-3 form-check">
          <input name="available" checked={form.available} onChange={onChange} type="checkbox" className="form-check-input" id="available" />
          <label className="form-check-label" htmlFor="available">Available to donate</label>
        </div>
        <div className="mb-3">
          <label className="form-label">Profile photo</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className={`form-control ${errors.photo? 'is-invalid':''}`} />
          {errors.photo && <div className="invalid-feedback">{errors.photo}</div>}
        </div>
        {msg && <div className="alert alert-info">{msg}</div>}
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>{isSubmitting? 'Saving...':'Save Profile'}</button>
      </form>
    </div>
  )
}
