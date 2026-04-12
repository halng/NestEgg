import { render, screen } from '@testing-library/react'
import { FilterSidebar } from '@/components/FilterSidebar'

describe('FilterSidebar Component', () => {
  it('renders essential filter titles', () => {
    render(<FilterSidebar />)
    
    expect(screen.getByText('Screener Filters')).toBeInTheDocument()
    expect(screen.getByText('Exchange')).toBeInTheDocument()
    expect(screen.getByText('Valuation')).toBeInTheDocument()
    expect(screen.getByText('Sector')).toBeInTheDocument()
  })

  it('renders specific stock exchanges checkboxes', () => {
    render(<FilterSidebar />)
    expect(screen.getByText('HOSE')).toBeInTheDocument()
    expect(screen.getByText('HNX')).toBeInTheDocument()
    expect(screen.getByText('UPCOM')).toBeInTheDocument()
  })

  it('renders utility buttons to apply or reset filters', () => {
    render(<FilterSidebar />)
    expect(screen.getByRole('button', { name: /Apply Filters/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reset All/i })).toBeInTheDocument()
  })
})
