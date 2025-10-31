import React, {useEffect, useState} from 'react'
import api from '../services/api'

export default function AdminDonations(){
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    api.loadToken()
    ;(async ()=>{
      try{
        const resp = await api.get('donations/')
        setDonations(resp.data)
      }catch(err){
        // ignore
      }finally{ setLoading(false) }
    })()
  },[])

  const approve = async (id) => {
    try{
      await api.post(`donations/${id}/approve/`)
      setDonations(donations.map(d=> d.id===id ? {...d, approved:true} : d))
    }catch(err){
      alert('Approve failed: ' + JSON.stringify(err.response?.data || err.message))
    }
  }

  if(loading) return <div>Loading donations...</div>

  return (
    <div>
      <h3>Donations</h3>
      {donations.length===0 && <div className="alert alert-info">No donations</div>}
      <ul className="list-group">
        {donations.map(d=> (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={d.id}>
            <div>
              <strong>{d.blood_group}</strong> x{d.units} — {d.donor?.username || 'Unknown'}
              <div className="text-muted">{d.blood_bank ? `Bank ${d.blood_bank}` : 'No bank selected'}</div>
            </div>
            <div>
              <span className={`badge me-2 ${d.approved ? 'bg-success' : 'bg-secondary'}`}>{d.approved ? 'approved' : 'pending'}</span>
              {!d.approved && <button className="btn btn-sm btn-success" onClick={()=>approve(d.id)}>Approve</button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
