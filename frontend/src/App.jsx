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
import Profile from './pages/Profile'
import { ToastProvider } from './components/ToastContext'
import BloodBanks from './pages/BloodBanks'
import DonorSearch from './pages/DonorSearch'
import DonationHistory from './pages/DonationHistory'
import RequestHistory from './pages/RequestHistory'

export default function App(){
  return (
    <ToastProvider>
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
            <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
            <Route path="/blood-banks" element={<ProtectedRoute><BloodBanks/></ProtectedRoute>} />
            <Route path="/donors" element={<ProtectedRoute><DonorSearch/></ProtectedRoute>} />
            <Route path="/donations/history" element={<ProtectedRoute><DonationHistory/></ProtectedRoute>} />
            <Route path="/requests/history" element={<ProtectedRoute><RequestHistory/></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><DonorDashboard/></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </ToastProvider>
  )
}
