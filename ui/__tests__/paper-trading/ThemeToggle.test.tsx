import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle, ThemeToggleCompact } from '@/components/paper-trading/ThemeToggle'

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

const mockMatchMedia = (matches: boolean) => {
  return {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()
    document.documentElement.classList.remove('dark')
    window.matchMedia = jest.fn().mockImplementation(() => mockMatchMedia(false))
  })

  it('renders theme options', async () => {
    render(<ThemeToggle />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByTitle('Light')).toBeInTheDocument()
    expect(screen.getByTitle('Dark')).toBeInTheDocument()
    expect(screen.getByTitle('System')).toBeInTheDocument()
  })

  it('renders loading skeleton before mounting', () => {
    const { container } = render(<ThemeToggle />)

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('system theme is selected by default', async () => {
    render(<ThemeToggle />)

    await act(async () => {
      await Promise.resolve()
    })

    const systemButton = screen.getByTitle('System')
    expect(systemButton).toHaveClass('bg-background')
  })

  it('changes theme to light when light button clicked', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getByTitle('Light'))

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('changes theme to dark when dark button clicked', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getByTitle('Dark'))

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('changes theme to system when system button clicked', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getByTitle('Dark'))
    await user.click(screen.getByTitle('System'))

    expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith('theme', 'system')
  })

  it('persists theme to localStorage', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getByTitle('Dark'))

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('loads saved theme from localStorage on mount', async () => {
    mockLocalStorage.getItem.mockReturnValue('dark')

    render(<ThemeToggle />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme')
  })

  it('highlights current theme option', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getByTitle('Dark'))

    const darkButton = screen.getByTitle('Dark')
    expect(darkButton).toHaveClass('bg-background')
  })

  it('applies system dark theme when system prefers dark', async () => {
    window.matchMedia = jest.fn().mockImplementation(() => mockMatchMedia(true))

    render(<ThemeToggle />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('applies system light theme when system prefers light', async () => {
    window.matchMedia = jest.fn().mockImplementation(() => mockMatchMedia(false))

    render(<ThemeToggle />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

describe('ThemeToggleCompact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('renders toggle button', async () => {
    render(<ThemeToggleCompact />)

    await act(async () => {
      await Promise.resolve()
    })

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('toggles between light and dark mode', async () => {
    const user = userEvent.setup()
    render(<ThemeToggleCompact />)

    await act(async () => {
      await Promise.resolve()
    })

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockLocalStorage.setItem).toHaveBeenCalled()
  })

  it('shows sun icon in dark mode', async () => {
    document.documentElement.classList.add('dark')

    render(<ThemeToggleCompact />)

    await act(async () => {
      await Promise.resolve()
    })

    const button = screen.getByTitle(/switch to light mode/i)
    expect(button).toBeInTheDocument()
  })

  it('shows moon icon in light mode', async () => {
    document.documentElement.classList.remove('dark')

    render(<ThemeToggleCompact />)

    await act(async () => {
      await Promise.resolve()
    })

    const button = screen.getByTitle(/switch to dark mode/i)
    expect(button).toBeInTheDocument()
  })

  it('persists theme change to localStorage', async () => {
    const user = userEvent.setup()
    render(<ThemeToggleCompact />)

    await act(async () => {
      await Promise.resolve()
    })

    await user.click(screen.getByRole('button'))

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', expect.any(String))
  })
})
