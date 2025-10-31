import React, { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

let idCounter = 1

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])

  const add = useCallback((type, message, timeout = 4000) => {
    const id = idCounter++
    setToasts(t => [{ id, type, message }, ...t])
    if(timeout > 0){
      setTimeout(() => {
        setToasts(t => t.filter(x => x.id !== id))
      }, timeout)
    }
    return id
  }, [])

  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast show mb-2 text-white ${t.type==='error' ? 'bg-danger' : 'bg-success'}`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={() => remove(t.id)}></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastContext)
  if(!ctx) throw new Error('useToast must be used within ToastProvider')
  return {
    success: (msg, t) => ctx.add('success', msg, t),
    error: (msg, t) => ctx.add('error', msg, t),
    remove: ctx.remove,
  }
}

export default ToastContext
