import React from 'react'

export default function App(){
  return (
    <div style={{padding:20, fontFamily:'Arial, sans-serif'}}>
      <h1>Blood Management System (Frontend)</h1>
      <p>This is a minimal React scaffold. Use the API at <code>/api/</code> to authenticate and fetch data.</p>
      <ul>
        <li>Login: /api/auth/login/</li>
        <li>Register: /api/auth/register/</li>
        <li>Donor profile: /api/donor-profiles/</li>
      </ul>
      <p>Build a full SPA from here (auth, dashboards, search, etc.).</p>
    </div>
  )
}
