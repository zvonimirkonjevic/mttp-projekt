/**
 * Tests for Billing Page - Payment status display and credit balance
 * Tests payment success/cancelled messages, credit display, and profile refresh
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock useSearchParams
let mockSearchParams = new URLSearchParams()
jest.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
}))

// Mock GlobalTransitionContext
const mockNavigateWithTransition = jest.fn()
jest.mock('@/app/dashboard/contexts/GlobalTransitionContext', () => ({
    useGlobalTransition: () => ({
        navigateWithTransition: mockNavigateWithTransition,
    }),
}))

// Mock UserContext
const mockRefreshProfile = jest.fn()
let mockProfile = {
    first_name: 'John',
    last_name: 'Doe',
    credits_balance: 500,
    stripe_customer_id: 'cus_test123',
}
let mockIsLoading = false

jest.mock('@/app/contexts/UserContext', () => ({
    useUser: () => ({
        profile: mockProfile,
        isLoading: mockIsLoading,
        refreshProfile: mockRefreshProfile,
    }),
}))

// Mock window.history.replaceState
const mockReplaceState = jest.fn()
Object.defineProperty(window, 'history', {
    value: { replaceState: mockReplaceState },
    writable: true,
})

// Mock crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
    value: () => 'test-uuid-1234',
})

// Import after mocks
import BillingPage from '@/app/settings/billing/page'

describe('BillingPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        mockSearchParams = new URLSearchParams()
        mockProfile = {
            first_name: 'John',
            last_name: 'Doe',
            credits_balance: 500,
            stripe_customer_id: 'cus_test123',
        }
        mockIsLoading = false
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('Rendering', () => {
        it('should render the page title', () => {
            render(<BillingPage />)

            expect(screen.getByRole('heading', { level: 1, name: 'Billing' })).toBeInTheDocument()
        })

        it('should render the plan section', () => {
            render(<BillingPage />)

            expect(screen.getByText('Self-serve')).toBeInTheDocument()
            expect(screen.getByText('Free Plan')).toBeInTheDocument()
        })

        it('should render upgrade plan button', () => {
            render(<BillingPage />)

            expect(screen.getByRole('button', { name: 'Upgrade plan' })).toBeInTheDocument()
        })

        it('should render credits balance card', () => {
            render(<BillingPage />)

            expect(screen.getByText('Credits')).toBeInTheDocument()
            expect(screen.getByText('Available for use')).toBeInTheDocument()
        })

        it('should render top up credits link', () => {
            render(<BillingPage />)

            const topUpLink = screen.getByRole('link', { name: 'Top up credits' })
            expect(topUpLink).toHaveAttribute('href', '/settings/topup')
        })

        it('should render presentations generated section', () => {
            render(<BillingPage />)

            expect(screen.getByText('Presentations generated')).toBeInTheDocument()
            expect(screen.getByText('0 of Unlimited')).toBeInTheDocument()
        })

        it('should render custom templates section with coming soon', () => {
            render(<BillingPage />)

            expect(screen.getByText('Custom Templates')).toBeInTheDocument()
            expect(screen.getByText('Coming soon')).toBeInTheDocument()
        })

        it('should render generation history section', () => {
            render(<BillingPage />)

            expect(screen.getByText('Generation History')).toBeInTheDocument()
            expect(screen.getByText('No presentations generated yet')).toBeInTheDocument()
        })

        it('should render create presentation button', () => {
            render(<BillingPage />)

            expect(screen.getByRole('button', { name: 'Create Presentation' })).toBeInTheDocument()
        })
    })

    describe('Credits display', () => {
        it('should display the current credit balance', () => {
            render(<BillingPage />)

            expect(screen.getByText('500')).toBeInTheDocument()
        })

        it('should display different credit balance when changed', () => {
            mockProfile.credits_balance = 1250

            render(<BillingPage />)

            expect(screen.getByText('1250')).toBeInTheDocument()
        })

        it('should display loading indicator when isLoading is true', () => {
            mockIsLoading = true

            render(<BillingPage />)

            expect(screen.getByText('...')).toBeInTheDocument()
        })

        it('should display 0 credits when profile has no credits', () => {
            mockProfile.credits_balance = 0

            render(<BillingPage />)

            expect(screen.getByText('0')).toBeInTheDocument()
        })

        it('should display 0 when profile is null', () => {
            mockProfile = null as any

            render(<BillingPage />)

            expect(screen.getByText('0')).toBeInTheDocument()
        })
    })

    describe('Payment success status', () => {
        it('should show success message when payment=success in URL', () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<BillingPage />)

            expect(screen.getByText('Payment successful!')).toBeInTheDocument()
            expect(screen.getByText('Your credits have been added to your account.')).toBeInTheDocument()
        })

        it('should call refreshProfile when payment is successful', () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<BillingPage />)

            expect(mockRefreshProfile).toHaveBeenCalled()
        })

        it('should auto-dismiss success message after 5 seconds', async () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<BillingPage />)

            expect(screen.getByText('Payment successful!')).toBeInTheDocument()

            // Fast-forward 5 seconds
            act(() => {
                jest.advanceTimersByTime(5000)
            })

            await waitFor(() => {
                expect(screen.queryByText('Payment successful!')).not.toBeInTheDocument()
            })
        })

        it('should clear URL after 5 seconds on success', () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<BillingPage />)

            act(() => {
                jest.advanceTimersByTime(5000)
            })

            expect(mockReplaceState).toHaveBeenCalledWith({}, '', '/settings/billing')
        })

        it('should show success icon in success message', () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<BillingPage />)

            // Success message container should have green styling
            const successContainer = screen.getByText('Payment successful!').closest('div')
            expect(successContainer?.parentElement).toHaveClass('bg-green-50')
        })
    })

    describe('Payment cancelled status', () => {
        it('should show cancelled message when payment=cancelled in URL', () => {
            mockSearchParams = new URLSearchParams('payment=cancelled')

            render(<BillingPage />)

            expect(screen.getByText('Payment cancelled')).toBeInTheDocument()
            expect(screen.getByText('Your payment was cancelled. No charges were made.')).toBeInTheDocument()
        })

        it('should NOT call refreshProfile when payment is cancelled', () => {
            mockSearchParams = new URLSearchParams('payment=cancelled')

            render(<BillingPage />)

            // refreshProfile should NOT be called for cancelled payments
            expect(mockRefreshProfile).not.toHaveBeenCalled()
        })

        it('should auto-dismiss cancelled message after 5 seconds', async () => {
            mockSearchParams = new URLSearchParams('payment=cancelled')

            render(<BillingPage />)

            expect(screen.getByText('Payment cancelled')).toBeInTheDocument()

            act(() => {
                jest.advanceTimersByTime(5000)
            })

            await waitFor(() => {
                expect(screen.queryByText('Payment cancelled')).not.toBeInTheDocument()
            })
        })

        it('should clear URL after 5 seconds on cancelled', () => {
            mockSearchParams = new URLSearchParams('payment=cancelled')

            render(<BillingPage />)

            act(() => {
                jest.advanceTimersByTime(5000)
            })

            expect(mockReplaceState).toHaveBeenCalledWith({}, '', '/settings/billing')
        })

        it('should show warning icon styling in cancelled message', () => {
            mockSearchParams = new URLSearchParams('payment=cancelled')

            render(<BillingPage />)

            // Cancelled message container should have yellow styling
            const cancelledContainer = screen.getByText('Payment cancelled').closest('div')
            expect(cancelledContainer?.parentElement).toHaveClass('bg-yellow-50')
        })
    })

    describe('No payment status', () => {
        it('should not show any payment message when no status in URL', () => {
            mockSearchParams = new URLSearchParams()

            render(<BillingPage />)

            expect(screen.queryByText('Payment successful!')).not.toBeInTheDocument()
            expect(screen.queryByText('Payment cancelled')).not.toBeInTheDocument()
        })

        it('should not call refreshProfile when no payment status', () => {
            mockSearchParams = new URLSearchParams()

            render(<BillingPage />)

            expect(mockRefreshProfile).not.toHaveBeenCalled()
        })
    })

    describe('Create presentation action', () => {
        it('should navigate with transition when Create Presentation is clicked', async () => {
            const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

            render(<BillingPage />)

            const createButton = screen.getByRole('button', { name: 'Create Presentation' })
            await user.click(createButton)

            expect(mockNavigateWithTransition).toHaveBeenCalledWith('/presentations/test-uuid-1234')
        })
    })

    describe('Timer cleanup', () => {
        it('should cleanup timer on unmount for success status', () => {
            mockSearchParams = new URLSearchParams('payment=success')

            const { unmount } = render(<BillingPage />)

            expect(screen.getByText('Payment successful!')).toBeInTheDocument()

            // Unmount before timer fires
            unmount()

            // Advance timers - should not throw
            act(() => {
                jest.advanceTimersByTime(5000)
            })

            // No assertion needed - just verifying no errors
        })

        it('should cleanup timer on unmount for cancelled status', () => {
            mockSearchParams = new URLSearchParams('payment=cancelled')

            const { unmount } = render(<BillingPage />)

            expect(screen.getByText('Payment cancelled')).toBeInTheDocument()

            unmount()

            act(() => {
                jest.advanceTimersByTime(5000)
            })
        })
    })

    describe('Edge cases', () => {
        it('should handle unknown payment status gracefully', () => {
            mockSearchParams = new URLSearchParams('payment=unknown')

            render(<BillingPage />)

            expect(screen.queryByText('Payment successful!')).not.toBeInTheDocument()
            expect(screen.queryByText('Payment cancelled')).not.toBeInTheDocument()
        })

        it('should handle other query params without affecting payment status', () => {
            mockSearchParams = new URLSearchParams('foo=bar&payment=success&baz=qux')

            render(<BillingPage />)

            expect(screen.getByText('Payment successful!')).toBeInTheDocument()
        })

        it('should not show message when payment param is empty', () => {
            mockSearchParams = new URLSearchParams('payment=')

            render(<BillingPage />)

            expect(screen.queryByText('Payment successful!')).not.toBeInTheDocument()
            expect(screen.queryByText('Payment cancelled')).not.toBeInTheDocument()
        })
    })
})
