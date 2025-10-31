import React from 'react'

export default function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', confirmDisabled = false }){
  if(!isOpen) return null
  return (
    <div className="modal d-block" tabIndex="-1" role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{cancelText}</button>
            <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={confirmDisabled}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
