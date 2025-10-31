import React from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api'

export default function ProtectedRoute({ children }){
  api.loadToken()
  const token = localStorage.getItem('bm_access_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}
