import React, {useEffect, useState} from 'react'
import api from '../services/api'
import { useToast } from '../components/ToastContext'

export default function AdminRequests(){
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [errors, setErrors] = useState({})

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
    // confirmation
    const ok = window.confirm(`Are you sure you want to ${verb} this request?`)
    if(!ok) return
    setActionLoading(prev => ({...prev, [id]: true}))
    setErrors(prev => ({...prev, [id]: null}))
    try{
      const resp = await api.post(`blood-requests/${id}/${verb}/`)
      setRequests(requests.map(r=> r.id===id ? {...r, status: resp.data.status || (verb==='approve'?'approved':'rejected')} : r))
      toast.success(`Request ${verb}ed successfully`)
    }catch(err){
      const msg = err.response?.data?.detail || JSON.stringify(err.response?.data || err.message)
      setErrors(prev => ({...prev, [id]: String(msg)}))
      toast.error(`Action failed: ${String(msg)}`)
    }finally{
      setActionLoading(prev => ({...prev, [id]: false}))
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
                  <button className="btn btn-sm btn-success me-2" onClick={()=>action(r.id,'approve')} disabled={actionLoading[r.id]}>{actionLoading[r.id]? 'Approving...' : 'Approve'}</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>action(r.id,'reject')} disabled={actionLoading[r.id]}>{actionLoading[r.id]? 'Rejecting...' : 'Reject'}</button>
                </>
              )}
              {errors[r.id] && <div className="text-danger small mt-1">{errors[r.id]}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
