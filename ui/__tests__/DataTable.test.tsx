import { render, screen, fireEvent } from '@testing-library/react'
import { DataTable } from '@/components/DataTable'
import { mockStocks } from '@/lib/mock-data'
import { useRouter } from 'next/navigation'

describe('DataTable Compare Interactions', () => {
  it('selects stocks and renders the Compare action button', () => {
    render(<DataTable data={mockStocks.slice(0, 3)} />)

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBe(3)

    // The onClick is attached to the <td> wrapper
    const firstCheckboxTd = checkboxes[0].parentElement?.parentElement
    if (firstCheckboxTd) fireEvent.click(firstCheckboxTd)

    // Verify floating bar appears with count
    expect(screen.getByText('1 Selected')).toBeInTheDocument()

    const secondCheckboxTd = checkboxes[1].parentElement?.parentElement
    if (secondCheckboxTd) fireEvent.click(secondCheckboxTd)

    expect(screen.getByText('2 Selected')).toBeInTheDocument()
  })

  it('navigates to /compare with chosen tickers when Compare is clicked', () => {
    const mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    })

    render(<DataTable data={mockStocks.slice(0, 3)} />)

    const checkboxes = screen.getAllByRole('checkbox')
    const firstCheckboxTd = checkboxes[0].parentElement?.parentElement
    if (firstCheckboxTd) fireEvent.click(firstCheckboxTd)

    const compareButton = screen.getByRole('button', { name: /Compare/i })
    fireEvent.click(compareButton)

    // Our mock mockStocks.slice(0, 3) begins with FPT
    expect(mockPush).toHaveBeenCalledWith('/compare?tickers=FPT')
  })
})
