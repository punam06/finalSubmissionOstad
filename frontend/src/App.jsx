import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Login from './pages/Login'
import Register from './pages/Register'
import DonorDashboard from './pages/DonorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Donate from './pages/Donate'
import RequestBlood from './pages/RequestBlood'
import 'bootstrap/dist/css/bootstrap.min.css'
import AdminRequests from './pages/AdminRequests'
import AdminDonations from './pages/AdminDonations'

export default function App(){
  return (
    <BrowserRouter>
      <Nav />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/donate" element={<Donate/>} />
          <Route path="/request" element={<RequestBlood/>} />
          <Route path="/admin/requests" element={<AdminRequests/>} />
          <Route path="/admin/donations" element={<AdminDonations/>} />
          <Route path="/" element={<DonorDashboard/>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
