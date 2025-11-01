import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useToast } from '../components/ToastContext'

export default function DonationHistory() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('date-desc')
  const { addToast } = useToast()

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const response = await api.get('donations/')
      setDonations(response.data)
    } catch (err) {
      addToast('Failed to fetch donation history', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Apply sorting
  let sortedDonations = [...donations]
  if (sortBy === 'date-desc') {
    sortedDonations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } else if (sortBy === 'date-asc') {
    sortedDonations.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } else if (sortBy === 'status') {
    sortedDonations.sort((a, b) => a.status.localeCompare(b.status))
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      completed: 'info',
    }
    const color = statusMap[status] || 'secondary'
    return <span className={`badge bg-${color}`}>{status.toUpperCase()}</span>
  }

  const getTotalUnits = () => {
    return donations
      .filter(d => d.status === 'approved' || d.status === 'completed')
      .reduce((sum, d) => sum + d.units_donated, 0)
  }

  const exportToCSV = async () => {
    try {
      const response = await API.get('/api/donations/export/', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'donations.csv')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      addToast('Donations exported successfully', 'success')
    } catch (err) {
      addToast('Failed to export donations', 'error')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="alert alert-info mt-4" role="alert">
        Loading donation history...
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h2 className="mb-4">My Donation History</h2>

      {/* Summary Stats */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Total Donations</h5>
              <h3 className="text-primary">{donations.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Units Donated</h5>
              <h3 className="text-success">{getTotalUnits()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Pending Approvals</h5>
              <h3 className="text-warning">{donations.filter(d => d.status === 'pending').length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-3 d-flex align-items-end gap-3">
        <div>
          <label className="form-label">Sort By:</label>
          <select
            className="form-select"
            style={{ maxWidth: '200px' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="status">Status</option>
          </select>
        </div>
        {donations.length > 0 && (
          <button
            className="btn btn-success"
            onClick={exportToCSV}
          >
            📥 Export as CSV
          </button>
        )}
      </div>

      {/* Donations List */}
      {donations.length === 0 ? (
        <div className="alert alert-info" role="alert">
          You haven't made any donations yet.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Blood Bank</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {sortedDonations.map((donation) => (
                <tr key={donation.id}>
                  <td>
                    <strong>{new Date(donation.created_at).toLocaleDateString()}</strong>
                    <br />
                    <small className="text-muted">
                      {new Date(donation.created_at).toLocaleTimeString()}
                    </small>
                  </td>
                  <td>
                    <span className="badge bg-info">{donation.blood_group}</span>
                  </td>
                  <td>
                    <span className="badge bg-secondary">{donation.units_donated} units</span>
                  </td>
                  <td>{donation.blood_bank_name || 'N/A'}</td>
                  <td>{getStatusBadge(donation.status)}</td>
                  <td>
                    {donation.notes ? (
                      <small>{donation.notes}</small>
                    ) : (
                      <small className="text-muted">-</small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
