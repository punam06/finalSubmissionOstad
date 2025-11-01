import React, { useEffect, useState } from 'react'
import { API } from '../services/api'
import { useToast } from '../components/ToastContext'

export default function RequestHistory() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('date-desc')
  const { addToast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await API.get('/api/blood-requests/')
      setRequests(response.data)
    } catch (err) {
      addToast('Failed to fetch request history', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Apply sorting
  let sortedRequests = [...requests]
  if (sortBy === 'date-desc') {
    sortedRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } else if (sortBy === 'date-asc') {
    sortedRequests.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } else if (sortBy === 'status') {
    sortedRequests.sort((a, b) => a.status.localeCompare(b.status))
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      fulfilled: 'info',
    }
    const color = statusMap[status] || 'secondary'
    return <span className={`badge bg-${color}`}>{status.toUpperCase()}</span>
  }

  const getPendingUnits = () => {
    return requests
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.units_required, 0)
  }

  const getFulfilledCount = () => {
    return requests.filter(r => r.status === 'fulfilled' || r.status === 'approved').length
  }

  const exportToCSV = async () => {
    try {
      const response = await API.get('/api/requests/export/', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'blood_requests.csv')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      addToast('Requests exported successfully', 'success')
    } catch (err) {
      addToast('Failed to export requests', 'error')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="alert alert-info mt-4" role="alert">
        Loading request history...
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h2 className="mb-4">My Blood Requests</h2>

      {/* Summary Stats */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Total Requests</h5>
              <h3 className="text-primary">{requests.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Fulfilled</h5>
              <h3 className="text-success">{getFulfilledCount()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Pending Units</h5>
              <h3 className="text-warning">{getPendingUnits()}</h3>
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
        {requests.length > 0 && (
          <button
            className="btn btn-success"
            onClick={exportToCSV}
          >
            📥 Export as CSV
          </button>
        )}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="alert alert-info" role="alert">
          You haven't made any blood requests yet.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Reason</th>
                <th>Hospital</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <strong>{new Date(request.created_at).toLocaleDateString()}</strong>
                    <br />
                    <small className="text-muted">
                      {new Date(request.created_at).toLocaleTimeString()}
                    </small>
                  </td>
                  <td>
                    <span className="badge bg-danger">{request.blood_group}</span>
                  </td>
                  <td>
                    <span className="badge bg-secondary">{request.units_required} units</span>
                  </td>
                  <td>
                    <small>{request.reason || 'N/A'}</small>
                  </td>
                  <td>{request.hospital_name || 'N/A'}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    {request.is_urgent ? (
                      <span className="badge bg-danger">URGENT</span>
                    ) : (
                      <span className="badge bg-light text-dark">Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Additional Info */}
      <div className="alert alert-info mt-4" role="alert">
        <strong>Note:</strong> Request status is automatically updated when blood donations are received at the hospital.
        Contact your hospital for detailed fulfillment information.
      </div>
    </div>
  )
}
