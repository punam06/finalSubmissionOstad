import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useToast } from '../components/ToastContext'

export default function DonorSearch() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterBloodGroup, setFilterBloodGroup] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterAvailable, setFilterAvailable] = useState('all')
  const { addToast } = useToast()

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    try {
      setLoading(true)
      const response = await api.get('donor-profiles/')
      setDonors(response.data)
    } catch (err) {
      addToast('Failed to fetch donors', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  let filteredDonors = donors

  if (filterBloodGroup) {
    filteredDonors = filteredDonors.filter(d => d.blood_group === filterBloodGroup)
  }

  if (filterCity) {
    filteredDonors = filteredDonors.filter(d =>
      d.city.toLowerCase().includes(filterCity.toLowerCase())
    )
  }

  if (filterAvailable === 'available') {
    filteredDonors = filteredDonors.filter(d => d.available === true)
  } else if (filterAvailable === 'unavailable') {
    filteredDonors = filteredDonors.filter(d => d.available === false)
  }

  if (loading) {
    return (
      <div className="alert alert-info mt-4" role="alert">
        Loading donors...
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h2 className="mb-4">Find Donors</h2>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Filter Donors</h5>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={filterBloodGroup}
                onChange={(e) => setFilterBloodGroup(e.target.value)}
              >
                <option value="">All Blood Groups</option>
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by city..."
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Availability</label>
              <select
                className="form-select"
                value={filterAvailable}
                onChange={(e) => setFilterAvailable(e.target.value)}
              >
                <option value="all">All Donors</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div className="col-md-3 mb-3 d-flex align-items-end">
              <button
                className="btn btn-secondary w-100"
                onClick={() => {
                  setFilterBloodGroup('')
                  setFilterCity('')
                  setFilterAvailable('all')
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="alert alert-info mb-3">
        Found <strong>{filteredDonors.length}</strong> donor(s)
      </div>

      {/* Donors List */}
      {filteredDonors.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          No donors found matching your criteria.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Blood Group</th>
                <th>Phone</th>
                <th>City</th>
                <th>Last Donated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((donor) => (
                <tr key={donor.id}>
                  <td>
                    <strong>{donor.user_username}</strong>
                  </td>
                  <td>
                    <span className="badge bg-primary">{donor.blood_group}</span>
                  </td>
                  <td>{donor.phone || 'N/A'}</td>
                  <td>{donor.city || 'N/A'}</td>
                  <td>
                    {donor.last_donated ? new Date(donor.last_donated).toLocaleDateString() : 'Never'}
                  </td>
                  <td>
                    {donor.available ? (
                      <span className="badge bg-success">Available</span>
                    ) : (
                      <span className="badge bg-secondary">Unavailable</span>
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
