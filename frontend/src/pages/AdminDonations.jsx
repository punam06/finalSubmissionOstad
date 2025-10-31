import React, {useEffect, useState} from 'react'
import api from '../services/api'
import { useToast } from '../components/ToastContext'
import Modal from '../components/Modal'

export default function AdminDonations(){
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [errors, setErrors] = useState({})

  // modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDonation, setModalDonation] = useState(null)
  const [bankInput, setBankInput] = useState('')

  const toast = useToast()

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

  const openApproveModal = (d) => {
    setModalDonation(d)
    setBankInput(d.blood_bank ? String(d.blood_bank) : '')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalDonation(null)
    setBankInput('')
  }

  const confirmApprove = async () => {
    if(!modalDonation) return
    const id = modalDonation.id
    setActionLoading(prev => ({...prev, [id]: true}))
    setErrors(prev => ({...prev, [id]: null}))
    try{
      // if no bank assigned, require bankInput
      if(!modalDonation.blood_bank){
        if(!bankInput) throw new Error('Bank id required to approve this donation')
        if(!/^\d+$/.test(bankInput)) throw new Error('Bank id must be numeric')
        await api.patch(`donations/${id}/`, { blood_bank: Number(bankInput) })
        setDonations(prev => prev.map(x => x.id===id ? { ...x, blood_bank: Number(bankInput) } : x))
      }

      await api.post(`donations/${id}/approve/`)
      setDonations(prev => prev.map(x=> x.id===id ? {...x, approved:true} : x))
      toast.success('Donation approved')
      closeModal()
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
              {!d.approved && <button className="btn btn-sm btn-success" onClick={()=>openApproveModal(d)} disabled={actionLoading[d.id]}>{actionLoading[d.id]? 'Processing...':'Approve'}</button>}
              {errors[d.id] && <div className="text-danger small mt-1">{errors[d.id]}</div>}
            </div>
          </li>
        ))}
      </ul>

      {/* Modal (Bootstrap markup) */}
      <Modal isOpen={modalOpen} title="Approve Donation" onClose={closeModal} onConfirm={confirmApprove} confirmDisabled={actionLoading[modalDonation?.id]} confirmText="Confirm Approve">
        <p>Donation: <strong>{modalDonation?.blood_group}</strong> x{modalDonation?.units} by {modalDonation?.donor?.username || 'Unknown'}</p>
        {modalDonation && !modalDonation.blood_bank && (
          <div className="mb-3">
            <label className="form-label">Assign Blood Bank (id)</label>
            <input className={`form-control`} value={bankInput} onChange={e=>setBankInput(e.target.value)} />
            <div className="form-text">Enter numeric blood bank id to attribute units to.</div>
          </div>
        )}
        {modalDonation && modalDonation.blood_bank && <div className="alert alert-info">This donation will be attributed to bank {modalDonation.blood_bank}</div>}
      </Modal>
    </div>
  )
}
