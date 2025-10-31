import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from '../pages/Register'

// A very small smoke test to ensure client-side validation runs
test('shows validation errors when submitting empty register form', async () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  )

  const button = screen.getByRole('button', { name: /register/i })
  fireEvent.click(button)

  // username and password validation messages should appear
  expect(await screen.findByText(/username must be at least 3 characters/i)).toBeTruthy()
  expect(await screen.findByText(/password must be at least 6 characters/i)).toBeTruthy()
})
