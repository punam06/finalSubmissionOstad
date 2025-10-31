import React, {useEffect, useState} from 'react'
import api from '../services/api'
import { useToast } from '../components/ToastContext'

export default function AdminDonations(){
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [errors, setErrors] = useState({})

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

  const approve = async (d) => {
    const id = d.id
    const proceed = window.confirm('Approve this donation?')
    if(!proceed) return
    setActionLoading(prev => ({...prev, [id]: true}))
    setErrors(prev => ({...prev, [id]: null}))
    try{
      // if donation has no bank assigned, prompt admin to provide one
      if(!d.blood_bank){
        const bankId = window.prompt('This donation has no blood bank set. Enter bank id to attribute (numeric):')
        if(!bankId) throw new Error('Bank id required to approve this donation')
        if(!/^\d+$/.test(bankId)) throw new Error('Bank id must be numeric')
        // patch donation to set bank
        await api.patch(`donations/${id}/`, { blood_bank: Number(bankId) })
        // refresh local donation entry to include bank
        d = { ...d, blood_bank: Number(bankId) }
        setDonations(prev => prev.map(x => x.id===id ? { ...x, blood_bank: Number(bankId) } : x))
      }

      await api.post(`donations/${id}/approve/`)
      setDonations(prev => prev.map(x=> x.id===id ? {...x, approved:true} : x))
      toast.success('Donation approved')
    }catch(err){
      const msg = err.response?.data?.detail || JSON.stringify(err.response?.data || err.message)
      setErrors(prev => ({...prev, [id]: String(msg)}))
      toast.error(`Approve failed: ${String(msg)}`)
    }finally{
      setActionLoading(prev => ({...prev, [id]: false}))
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
