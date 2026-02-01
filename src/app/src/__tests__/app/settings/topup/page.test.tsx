/**
 * Tests for TopUp Page - Credit purchase and Stripe checkout flow
 * Tests package selection, price formatting, checkout initiation, and error handling
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock Supabase client
const mockGetSession = jest.fn()
jest.mock('@/utils/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getSession: mockGetSession,
        },
    }),
}))

// Mock window.location
const mockLocationAssign = jest.fn()
Object.defineProperty(window, 'location', {
    value: { href: '', assign: mockLocationAssign },
    writable: true,
})

// Import after mocks
import TopUpPage from '@/app/settings/topup/page'

describe('TopUpPage', () => {
    const mockSession = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetSession.mockResolvedValue({ data: { session: mockSession } })
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test-session' }),
        })
        // Reset window.location.href
        window.location.href = ''
        // Set environment variable
        process.env.NEXT_PUBLIC_API_CONTAINER_URL = 'http://localhost:3001'
    })

    describe('Rendering', () => {
        it('should render the page title', () => {
            render(<TopUpPage />)

            expect(screen.getByText('Purchase Credits')).toBeInTheDocument()
        })

        it('should render the page description', () => {
            render(<TopUpPage />)

            expect(screen.getByText(/Select a credit package below/i)).toBeInTheDocument()
        })

        it('should render all 5 credit packages', () => {
            render(<TopUpPage />)

            // Credits may appear multiple times (package list + summary for selected)
            expect(screen.getAllByText('500 credits').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('1.000 credits').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('2.500 credits').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('5.000 credits').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('10.000 credits').length).toBeGreaterThanOrEqual(1)
        })

        it('should render prices for all packages', () => {
            render(<TopUpPage />)

            // Prices may appear multiple times (package list + summary for selected)
            expect(screen.getAllByText('5 €').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('10 €').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('25 €').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('50 €').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('100 €').length).toBeGreaterThanOrEqual(1)
        })

        it('should mark 1000 credits package as recommended', () => {
            render(<TopUpPage />)

            expect(screen.getByText('Recommended')).toBeInTheDocument()
        })

        it('should render the checkout button', () => {
            render(<TopUpPage />)

            expect(screen.getByRole('button', { name: /Continue to Payment/i })).toBeInTheDocument()
        })

        it('should render the summary section', () => {
            render(<TopUpPage />)

            expect(screen.getByText('Selected package')).toBeInTheDocument()
            expect(screen.getByText('Amount due')).toBeInTheDocument()
        })

        it('should render Stripe notice in summary', () => {
            render(<TopUpPage />)

            expect(screen.getByText(/Payment is processed securely via Stripe/i)).toBeInTheDocument()
        })
    })

    describe('Default selection', () => {
        it('should have 1000 credits package selected by default', () => {
            render(<TopUpPage />)

            // The summary should show 1000 credits
            const summaryCredits = screen.getAllByText('1.000 credits')
            expect(summaryCredits.length).toBeGreaterThanOrEqual(1)
        })

        it('should show 10 € as default amount due', () => {
            render(<TopUpPage />)

            // Amount due should be 10 €
            const amountDue = screen.getByText('Amount due').nextElementSibling
            expect(amountDue).toHaveTextContent('10 €')
        })
    })

    describe('Package selection', () => {
        it('should update summary when selecting 500 credits package', async () => {
            const user = userEvent.setup()
            render(<TopUpPage />)

            const package500 = screen.getByText('500 credits').closest('button')
            await user.click(package500!)

            // Check summary updated
            const summarySection = screen.getByText('Selected package').parentElement
            expect(summarySection).toHaveTextContent('500 credits')
        })

        it('should update summary when selecting 2500 credits package', async () => {
            const user = userEvent.setup()
            render(<TopUpPage />)

            const package2500 = screen.getByText('2.500 credits').closest('button')
            await user.click(package2500!)

            const summarySection = screen.getByText('Selected package').parentElement
            expect(summarySection).toHaveTextContent('2.500 credits')
        })

        it('should update amount due when selecting different package', async () => {
            const user = userEvent.setup()
            render(<TopUpPage />)

            const package5000 = screen.getByText('5.000 credits').closest('button')
            await user.click(package5000!)

            const amountDue = screen.getByText('Amount due').nextElementSibling
            expect(amountDue).toHaveTextContent('50 €')
        })

        it('should show visual selection indicator for selected package', async () => {
            const user = userEvent.setup()
            render(<TopUpPage />)

            const package500Button = screen.getByText('500 credits').closest('button')
            await user.click(package500Button!)

            // Selected package should have brand border class
            expect(package500Button).toHaveClass('border-brand')
        })
    })

    describe('Checkout flow - Success', () => {
        it('should call Supabase getSession when checkout is clicked', async () => {
            const user = userEvent.setup()
            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            expect(mockGetSession).toHaveBeenCalled()
        })

        it('should call checkout API with correct payload', async () => {
            const user = userEvent.setup()
            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/create-checkout-session',
                    expect.objectContaining({
                        method: 'POST',
                        headers: expect.objectContaining({
                            'Authorization': 'Bearer test-access-token',
                            'Content-Type': 'application/json',
                        }),
                        body: JSON.stringify({ credit_option: '1000' }),
                    })
                )
            })
        })

        it('should send correct credit_option for selected package', async () => {
            const user = userEvent.setup()
            render(<TopUpPage />)

            // Select 500 credits package
            const package500 = screen.getByText('500 credits').closest('button')
            await user.click(package500!)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        body: JSON.stringify({ credit_option: '500' }),
                    })
                )
            })
        })

        it('should redirect to Stripe checkout URL on success', async () => {
            const user = userEvent.setup()
            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(window.location.href).toBe('https://checkout.stripe.com/test-session')
            })
        })
    })

    describe('Checkout flow - Loading state', () => {
        it('should show loading state during checkout', async () => {
            const user = userEvent.setup()
            // Make fetch hang
            mockFetch.mockImplementation(() => new Promise(() => {}))

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            expect(screen.getByText('Processing...')).toBeInTheDocument()
        })

        it('should disable checkout button during loading', async () => {
            const user = userEvent.setup()
            mockFetch.mockImplementation(() => new Promise(() => {}))

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            expect(screen.getByRole('button', { name: /Processing/i })).toBeDisabled()
        })

        it('should disable package selection during loading', async () => {
            const user = userEvent.setup()
            mockFetch.mockImplementation(() => new Promise(() => {}))

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            const packageButtons = screen.getAllByRole('button').filter(
                btn => btn.textContent?.includes('credits') && btn.textContent?.includes('€')
            )

            packageButtons.forEach(button => {
                expect(button).toBeDisabled()
            })
        })
    })

    describe('Checkout flow - Error handling', () => {
        it('should show error when user is not logged in', async () => {
            const user = userEvent.setup()
            mockGetSession.mockResolvedValue({ data: { session: null } })

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(screen.getByText('Please log in to purchase credits')).toBeInTheDocument()
            })
        })

        it('should show error when session has no access token', async () => {
            const user = userEvent.setup()
            mockGetSession.mockResolvedValue({ data: { session: { access_token: null } } })

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(screen.getByText('Please log in to purchase credits')).toBeInTheDocument()
            })
        })

        it('should show error when API returns non-ok response', async () => {
            const user = userEvent.setup()
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: () => Promise.resolve('Server error'),
            })

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(screen.getByText('Failed to initialize payment. Please try again.')).toBeInTheDocument()
            })
        })

        it('should show error when API returns no URL', async () => {
            const user = userEvent.setup()
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ url: null }),
            })

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(screen.getByText('Failed to initialize payment. Please try again.')).toBeInTheDocument()
            })
        })

        it('should show error when fetch throws', async () => {
            const user = userEvent.setup()
            mockFetch.mockRejectedValue(new Error('Network error'))

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(screen.getByText('Failed to initialize payment. Please try again.')).toBeInTheDocument()
            })
        })

        it('should reset loading state on error', async () => {
            const user = userEvent.setup()
            mockFetch.mockRejectedValue(new Error('Network error'))

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Continue to Payment/i })).not.toBeDisabled()
            })
        })

        it('should not call API when not logged in', async () => {
            const user = userEvent.setup()
            mockGetSession.mockResolvedValue({ data: { session: null } })

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(screen.getByText('Please log in to purchase credits')).toBeInTheDocument()
            })

            expect(mockFetch).not.toHaveBeenCalled()
        })
    })

    describe('Price formatting', () => {
        it('should format credits with German locale (dots for thousands)', () => {
            render(<TopUpPage />)

            // German locale uses dots for thousands
            // Credits may appear multiple times (package list + summary for selected)
            expect(screen.getAllByText('1.000 credits').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('2.500 credits').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('5.000 credits').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('10.000 credits').length).toBeGreaterThanOrEqual(1)
        })

        it('should format prices in EUR with German locale', () => {
            render(<TopUpPage />)

            // German locale EUR format - prices may appear multiple times (package + summary)
            expect(screen.getAllByText('5 €').length).toBeGreaterThanOrEqual(1)
            // 10 € appears in package list AND in summary (default selected)
            expect(screen.getAllByText('10 €').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('25 €').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('50 €').length).toBeGreaterThanOrEqual(1)
            expect(screen.getAllByText('100 €').length).toBeGreaterThanOrEqual(1)
        })

        it('should show price per 100 credits for each package', () => {
            render(<TopUpPage />)

            // All packages have same price per 100 credits (1 €)
            const pricePerCreditsTexts = screen.getAllByText('1 € per 100 credits')
            expect(pricePerCreditsTexts.length).toBe(5)
        })
    })

    describe('Environment configuration', () => {
        it('should use NEXT_PUBLIC_API_CONTAINER_URL when available', async () => {
            const user = userEvent.setup()
            process.env.NEXT_PUBLIC_API_CONTAINER_URL = 'https://api.production.com'

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    'https://api.production.com/create-checkout-session',
                    expect.any(Object)
                )
            })
        })

        it('should fall back to localhost when no env var is set', async () => {
            const user = userEvent.setup()
            delete process.env.NEXT_PUBLIC_API_CONTAINER_URL
            delete process.env.API_CONTAINER_URL

            // Spy on console.warn
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

            render(<TopUpPage />)

            const checkoutButton = screen.getByRole('button', { name: /Continue to Payment/i })
            await user.click(checkoutButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    'http://localhost:3001/create-checkout-session',
                    expect.any(Object)
                )
            })

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Client missing NEXT_PUBLIC_API_CONTAINER_URL')
            )

            consoleSpy.mockRestore()
        })
    })

    describe('Accessibility', () => {
        it('should have proper heading structure', () => {
            render(<TopUpPage />)

            const heading = screen.getByRole('heading', { level: 1 })
            expect(heading).toHaveTextContent('Purchase Credits')
        })

        it('should have accessible buttons for all packages', () => {
            render(<TopUpPage />)

            const buttons = screen.getAllByRole('button')
            // 5 package buttons + 1 checkout button
            expect(buttons.length).toBeGreaterThanOrEqual(6)
        })
    })
})
