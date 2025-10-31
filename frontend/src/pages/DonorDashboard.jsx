import React, {useEffect, useState} from 'react'
import api from '../services/api'

export default function DonorDashboard(){
  const [profile, setProfile] = useState(null)
  const [donations, setDonations] = useState([])

  useEffect(()=>{
    api.loadToken()
    ;(async ()=>{
      try{
        const me = await api.get('users/me/')
        // try load donor profile
        const resp = await api.get('donor-profiles/')
        setProfile(resp.data[0] || null)
        const d = await api.get('donations/')
        setDonations(d.data)
      }catch(err){
        // ignore
      }
    })()
  },[])

  const [filterGroup, setFilterGroup] = useState('')

  const search = async () => {
    try{
      const q = []
      if(filterGroup) q.push(`blood_group=${encodeURIComponent(filterGroup)}`)
      const url = '/api/donor-profiles/' + (q.length? `?${q.join('&')}` : '')
      const resp = await api.get(url)
      setProfile(resp.data[0] || null)
    }catch(err){
      // ignore
    }
  }

  return (
    <div>
      <h2>Donor Dashboard</h2>
      <div className="mb-3">
        <label className="form-label">Search donors by blood group</label>
        <div className="d-flex">
          <select className="form-select me-2" value={filterGroup} onChange={e=>setFilterGroup(e.target.value)}>
            <option value="">-- any --</option>
            <option>O+</option>
            <option>O-</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
          <button className="btn btn-outline-primary" onClick={search}>Search</button>
        </div>
      </div>
      {profile ? (
        <div className="mb-3">
          <h4>Profile</h4>
          <p>Blood group: {profile.blood_group}</p>
          <p>City: {profile.city}</p>
        </div>
      ) : <div className="alert alert-warning">No profile found</div>}

      <div>
        <h4>Donations</h4>
        <ul className="list-group">
          {donations.map(d=> (
            <li className="list-group-item" key={d.id}>{d.blood_group} x{d.units} - {d.approved ? 'Approved' : 'Pending'}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
