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
          <Route path="/" element={<DonorDashboard/>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
