import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useToast } from '../components/ToastContext'

export default function BloodBanks() {
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const { addToast } = useToast()

  useEffect(() => {
    fetchBanks()
  }, [])

  const fetchBanks = async () => {
    try {
      setLoading(true)
      const response = await api.get('blood-banks/')
      setBanks(response.data)
    } catch (err) {
      addToast('Failed to fetch blood banks', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort banks
  let filteredBanks = banks
  if (searchCity) {
    filteredBanks = filteredBanks.filter(b => 
      b.city.toLowerCase().includes(searchCity.toLowerCase())
    )
  }

  if (sortBy === 'name') {
    filteredBanks.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy === 'city') {
    filteredBanks.sort((a, b) => a.city.localeCompare(b.city))
  }

  // Calculate total units for a bank
  const getTotalUnits = (bank) => {
    return bank.units_a_plus + bank.units_a_minus + bank.units_b_plus + bank.units_b_minus +
           bank.units_o_plus + bank.units_o_minus + bank.units_ab_plus + bank.units_ab_minus
  }

  // Get blood group badge color
  const getUnitBadgeClass = (units) => {
    if (units === 0) return 'badge bg-danger'
    if (units < 5) return 'badge bg-warning'
    return 'badge bg-success'
  }

  if (loading) {
    return (
      <div className="alert alert-info mt-4" role="alert">
        Loading blood banks...
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h2 className="mb-4">Blood Banks Directory</h2>

      {/* Search & Sort */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by city..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="city">Sort by City</option>
          </select>
        </div>
      </div>

      {/* Banks List */}
      {filteredBanks.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          No blood banks found.
        </div>
      ) : (
        <div className="row">
          {filteredBanks.map((bank) => (
            <div key={bank.id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{bank.name}</h5>
                  <p className="card-text text-muted">
                    📍 {bank.city}
                    {bank.address && <><br /><small>{bank.address}</small></>}
                  </p>
                  
                  {/* Total Units Summary */}
                  <div className="mb-3">
                    <small className="text-secondary">Total Units:</small>
                    <br />
                    <span className="badge bg-info">{getTotalUnits(bank)} units</span>
                  </div>

                  {/* Blood Group Inventory */}
                  <div className="mb-3">
                    <small className="text-secondary d-block mb-2">Inventory by Blood Group:</small>
                    <div className="d-flex flex-wrap gap-1">
                      <span className={getUnitBadgeClass(bank.units_a_plus)}>A+ {bank.units_a_plus}</span>
                      <span className={getUnitBadgeClass(bank.units_a_minus)}>A- {bank.units_a_minus}</span>
                      <span className={getUnitBadgeClass(bank.units_b_plus)}>B+ {bank.units_b_plus}</span>
                      <span className={getUnitBadgeClass(bank.units_b_minus)}>B- {bank.units_b_minus}</span>
                      <span className={getUnitBadgeClass(bank.units_o_plus)}>O+ {bank.units_o_plus}</span>
                      <span className={getUnitBadgeClass(bank.units_o_minus)}>O- {bank.units_o_minus}</span>
                      <span className={getUnitBadgeClass(bank.units_ab_plus)}>AB+ {bank.units_ab_plus}</span>
                      <span className={getUnitBadgeClass(bank.units_ab_minus)}>AB- {bank.units_ab_minus}</span>
                    </div>
                  </div>

                  {/* Low Stock Warning */}
                  {getTotalUnits(bank) < 10 && (
                    <div className="alert alert-warning alert-sm py-2 px-3 mb-0" role="alert">
                      ⚠️ Low stock alert
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
