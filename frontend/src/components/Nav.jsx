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
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!user && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/login">Login</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/register">Register</a>
                </li>
              </>
            )}
            {user && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/blood-banks">Blood Banks</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/donors">Find Donors</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/donate">Donate</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/donations/history">Donation History</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/request">Request Blood</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/requests/history">Request History</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/profile">Profile</a>
                </li>
                {user.role === 'admin' && (
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown">
                      Admin
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                      <li><a className="dropdown-item" href="/admin">Dashboard</a></li>
                      <li><a className="dropdown-item" href="/admin/requests">Manage Requests</a></li>
                      <li><a className="dropdown-item" href="/admin/donations">Manage Donations</a></li>
                    </ul>
                  </li>
                )}
                <li className="nav-item">
                  <button className="nav-link btn btn-link text-danger" onClick={logout}>Logout</button>
                </li>
              </>
            )}
            {!user && (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/donate">Donate</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/request">Request</a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
