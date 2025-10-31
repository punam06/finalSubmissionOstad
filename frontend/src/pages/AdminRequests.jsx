import React, {useEffect, useState} from 'react'
import api from '../services/api'

export default function AdminRequests(){
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    api.loadToken()
    ;(async ()=>{
      try{
        const resp = await api.get('blood-requests/')
        setRequests(resp.data)
      }catch(err){
        // ignore
      }finally{ setLoading(false) }
    })()
  },[])

  const action = async (id, verb) => {
    try{
      await api.post(`blood-requests/${id}/${verb}/`)
      setRequests(requests.map(r=> r.id===id ? {...r, status: verb==='approve'?'approved':'rejected'} : r))
    }catch(err){
      alert('Action failed: ' + JSON.stringify(err.response?.data || err.message))
    }
  }

  if(loading) return <div>Loading requests...</div>

  return (
    <div>
      <h3>Blood Requests</h3>
      {requests.length===0 && <div className="alert alert-info">No requests</div>}
      <ul className="list-group">
        {requests.map(r=> (
          <li className="list-group-item d-flex justify-content-between align-items-center" key={r.id}>
            <div>
              <strong>{r.blood_group}</strong> x{r.units} — {r.requester?.username || 'Unknown'}
              <div className="text-muted">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            <div>
              <span className={`badge me-2 ${r.status==='pending'?'bg-secondary': r.status==='approved'?'bg-success':'bg-danger'}`}>{r.status}</span>
              {r.status==='pending' && (
                <>
                  <button className="btn btn-sm btn-success me-2" onClick={()=>action(r.id,'approve')}>Approve</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>action(r.id,'reject')}>Reject</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
