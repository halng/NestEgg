import { render, screen } from '@testing-library/react'
import { StockChart } from '@/components/StockChart'
import { mockStocks } from '@/lib/mock-data'

describe('StockChart Component', () => {
  it('renders chart container', () => {
    // Select the first mocked stock (FPT)
    const stock = mockStocks[0]
    
    const { container } = render(<StockChart data={stock.historicalData} ticker={stock.ticker} />)
    
    expect(screen.getByText(`${stock.ticker} - Price & Volume`)).toBeInTheDocument()
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })
})
