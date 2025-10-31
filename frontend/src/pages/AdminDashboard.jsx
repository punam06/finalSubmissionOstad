import React, {useEffect, useState} from 'react'
import api from '../services/api'

export default function AdminDashboard(){
  const [stats, setStats] = useState(null)

  useEffect(()=>{
    api.loadToken()
    ;(async ()=>{
      try{
        const resp = await api.get('admin/dashboard/')
        setStats(resp.data)
      }catch(err){
        // ignore
      }
    })()
  },[])

  if(!stats) return <div>Loading...</div>

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Total donors: {stats.total_donors}</p>
      <p>Pending requests: {stats.pending_requests}</p>
      <h4>Available units</h4>
      <ul>
        {Object.entries(stats.available_units).map(([k,v])=> (<li key={k}>{k}: {v}</li>))}
      </ul>
    </div>
  )
}
