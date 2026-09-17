import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => vi.restoreAllMocks())

  it('loads jobs and displays them', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{
        id: '49d9d95e-f72b-4b1a-bc67-b14392dab676',
        title: 'Generate report',
        type: 'report',
        status: 'pending',
        createdAt: '2026-09-16T00:00:00.000Z',
      }]), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )

    render(<App />)
    expect(screen.getByText('Loading jobs…')).toBeInTheDocument()
    expect(await screen.findByText('Generate report')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('1 shown')).toBeInTheDocument())
  })

  it('shows an API error state', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Service unavailable' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable')
  })
})
