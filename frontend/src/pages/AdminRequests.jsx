import React, {useEffect, useState} from 'react'
import api from '../services/api'
import { useToast } from '../components/ToastContext'
import Modal from '../components/Modal'

export default function AdminRequests(){
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [errors, setErrors] = useState({})

  // modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalRequest, setModalRequest] = useState(null)
  const [modalVerb, setModalVerb] = useState('')

  const toast = useToast()

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
  const openModal = (req, verb) => {
    setModalRequest(req)
    setModalVerb(verb)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalRequest(null)
    setModalVerb('')
  }

  const action = async () => {
    if(!modalRequest || !modalVerb) return
    const id = modalRequest.id
    const verb = modalVerb
    setActionLoading(prev => ({...prev, [id]: true}))
    setErrors(prev => ({...prev, [id]: null}))
    try{
      const resp = await api.post(`blood-requests/${id}/${verb}/`)
      setRequests(requests.map(r=> r.id===id ? {...r, status: resp.data.status || (verb==='approve'?'approved':'rejected')} : r))
      toast.success(`Request ${verb}ed successfully`)
      closeModal()
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
                  <button className="btn btn-sm btn-success me-2" onClick={()=>openModal(r,'approve')} disabled={actionLoading[r.id]}>{actionLoading[r.id]? 'Approving...' : 'Approve'}</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>openModal(r,'reject')} disabled={actionLoading[r.id]}>{actionLoading[r.id]? 'Rejecting...' : 'Reject'}</button>
                </>
              )}
              {errors[r.id] && <div className="text-danger small mt-1">{errors[r.id]}</div>}
            </div>
          </li>
        ))}
      </ul>

    <Modal isOpen={modalOpen} title={modalVerb === 'approve' ? 'Approve Request' : 'Reject Request'} onClose={closeModal} onConfirm={action} confirmText={modalVerb === 'approve' ? 'Approve' : 'Reject'} confirmDisabled={actionLoading[modalRequest?.id]}>
      <p>Request: <strong>{modalRequest?.blood_group}</strong> x{modalRequest?.units} — {modalRequest?.requester?.username || 'Unknown'}</p>
      <div className="text-muted">{modalRequest && new Date(modalRequest.created_at).toLocaleString()}</div>
    </Modal>
    </div>
  )
}
