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
import ProtectedRoute from './components/ProtectedRoute'

export default function App(){
  return (
    <BrowserRouter>
      <Nav />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>} />
          <Route path="/donate" element={<ProtectedRoute><Donate/></ProtectedRoute>} />
          <Route path="/request" element={<ProtectedRoute><RequestBlood/></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute><AdminRequests/></ProtectedRoute>} />
          <Route path="/admin/donations" element={<ProtectedRoute><AdminDonations/></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><DonorDashboard/></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
