import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

import AdminDonations from '../pages/AdminDonations'
import { ToastProvider } from '../components/ToastContext'
import { MemoryRouter } from 'react-router-dom'

// Mock the api module used by the component
vi.mock('../services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  loadToken: vi.fn(),
}))

import api from '../services/api'

describe('AdminDonations modal flow', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('approves a donation after entering bank id in modal', async () => {
    const donation = { id: 1, blood_group: 'O+', units: 2, donor: { username: 'donor1' }, blood_bank: null, approved: false }
    api.get.mockResolvedValue({ data: [donation] })
    api.patch.mockResolvedValue({ data: { ...donation, blood_bank: 5 } })
    api.post.mockResolvedValue({ data: { ...donation, approved: true } })

    render(
      <ToastProvider>
        <MemoryRouter>
          <AdminDonations />
        </MemoryRouter>
      </ToastProvider>
    )

    // Wait for Approve button to appear
    const approveBtn = await screen.findByRole('button', { name: /approve/i })
    fireEvent.click(approveBtn)

    // modal should ask for bank id
    const bankInput = await screen.findByLabelText(/Assign Blood Bank/i)
    fireEvent.change(bankInput, { target: { value: '5' } })

    const confirm = screen.getByRole('button', { name: /Confirm Approve/i })
    fireEvent.click(confirm)

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(`donations/1/`, { blood_bank: 5 })
      expect(api.post).toHaveBeenCalledWith(`donations/1/approve/`)
    })

    // After approval the badge should show approved
    expect(await screen.findByText(/approved/i)).toBeInTheDocument()
  })
})
