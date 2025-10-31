import React, {useEffect, useState} from 'react'
import api from '../services/api'

export default function Nav(){
  const [user, setUser] = useState(null)

  useEffect(()=>{
    api.loadToken()
    ;(async ()=>{
      try{
        const resp = await api.get('users/me/')
        setUser(resp.data)
      }catch(err){
        setUser(null)
      }
    })()
  },[])

  const logout = ()=>{
    api.clearTokens()
    window.location.href = '/'
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">BloodMS</a>
        <div className="d-flex">
          {!user && (
            <>
              <a className="btn btn-outline-primary me-2" href="/login">Login</a>
              <a className="btn btn-outline-success me-2" href="/register">Register</a>
            </>
          )}
          <a className="btn btn-outline-secondary me-2" href="/donate">Donate</a>
          <a className="btn btn-outline-warning me-2" href="/request">Request</a>
          {user && user.role === 'admin' && (
            <a className="btn btn-outline-dark me-2" href="/admin">Admin</a>
          )}
          {user && <button className="btn btn-danger" onClick={logout}>Logout</button>}
        </div>
      </div>
    </nav>
  )
}
