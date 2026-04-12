import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from '@/components/shared/Navbar'
import { useRouter } from 'next/navigation'

describe('Navbar Search Functionality', () => {
  it('updates input value on change', () => {
    render(<Navbar />)
    const input = screen.getByPlaceholderText(/Search ticker/i) as HTMLInputElement
    
    fireEvent.change(input, { target: { value: 'FPT' } })
    expect(input.value).toBe('FPT')
  })

  it('pushes to router on Enter key press', () => {
    const mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    })

    render(<Navbar />)
    const input = screen.getByPlaceholderText(/Search ticker/i)

    fireEvent.change(input, { target: { value: 'SSI' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(mockPush).toHaveBeenCalledWith('/?q=SSI')
  })
})
