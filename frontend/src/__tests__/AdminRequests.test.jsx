import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

import AdminRequests from '../pages/AdminRequests'
import { ToastProvider } from '../components/ToastContext'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  loadToken: vi.fn(),
}))

import api from '../services/api'

describe('AdminRequests modal flow', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('approves a request via modal', async () => {
    const req = { id: 1, blood_group: 'A+', units: 3, requester: { username: 'user1' }, created_at: new Date().toISOString(), status: 'pending' }
    api.get.mockResolvedValue({ data: [req] })
    api.post.mockResolvedValue({ data: { ...req, status: 'approved' } })

    render(
      <ToastProvider>
        <MemoryRouter>
          <AdminRequests />
        </MemoryRouter>
      </ToastProvider>
    )

    const approveBtn = await screen.findByRole('button', { name: /approve/i })
    fireEvent.click(approveBtn)

    const confirm = await screen.findByRole('button', { name: /Approve/i })
    fireEvent.click(confirm)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(`blood-requests/1/approve/`)
    })

    expect(await screen.findByText(/approved/i)).toBeInTheDocument()
  })
})
