import '@testing-library/jest-dom'

// Properly mock next/navigation using jest.fn() so tests can augment it via mockReturnValue
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/')
}))
