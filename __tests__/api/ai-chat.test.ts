/**
 * Minimal tests for AI Chat API Route
 */

import { POST } from '@/app/api/ai-chat/route'
import { NextRequest } from 'next/server'

global.fetch = jest.fn()

describe('AI Chat API', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('should return 400 if message is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai-chat', {
      method: 'POST',
      body: JSON.stringify({ ticker: 'AAPL' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Message is required')
  })

  it('should perform search and return streaming response', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('brave.com')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            web: {
              results: [
                {
                  title: 'AAPL News',
                  url: 'https://example.com',
                  description: 'Apple stock info',
                },
              ],
            },
          }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'AI response about AAPL' } }],
        }),
      })
    })

    const req = new NextRequest('http://localhost:3000/api/ai-chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Tell me about AAPL',
        ticker: 'AAPL',
        stockData: { currentPrice: 150 },
      }),
    })

    const response = await POST(req)

    expect(response.headers.get('Content-Type')).toBe('text/event-stream')
    expect(response.status).toBe(200)
  })

  it('should handle API errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const req = new NextRequest('http://localhost:3000/api/ai-chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Test',
        ticker: 'AAPL',
      }),
    })

    const response = await POST(req)
    expect(response.status).toBe(200) // Streaming response even on error
  })
})
