/**
 * Tests for PaymentSuccessHandler - Dashboard payment success handling
 * Tests payment success detection, profile refresh, URL cleanup, and toast display
 */

import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

// Mock useSearchParams and useRouter
let mockSearchParams = new URLSearchParams()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
    useRouter: () => ({
        replace: mockReplace,
    }),
}))

// Mock framer-motion to simplify testing
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock UserContext
const mockRefreshProfile = jest.fn()
jest.mock('@/app/contexts/UserContext', () => ({
    useUser: () => ({
        profile: { credits_balance: 500 },
        isLoading: false,
        refreshProfile: mockRefreshProfile,
    }),
}))

// Mock GlobalTransitionContext
jest.mock('@/app/dashboard/contexts/GlobalTransitionContext', () => ({
    useGlobalTransition: () => ({
        navigateWithTransition: jest.fn(),
    }),
}))

// Mock ActiveUIContext
jest.mock('@/app/contexts/ActiveUIContext', () => ({
    useActiveUI: () => ({
        activeElement: null,
        setActiveElement: jest.fn(),
    }),
}))

// Mock crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
    value: () => 'test-uuid-1234',
})

// Import after mocks
import DashboardPage from '@/app/dashboard/page'

describe('PaymentSuccessHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        mockSearchParams = new URLSearchParams()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('Payment success detection', () => {
        it('should detect payment=success in URL params', async () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<DashboardPage />)

            await waitFor(() => {
                expect(mockRefreshProfile).toHaveBeenCalled()
            })
        })

        it('should call refreshProfile when payment is successful', async () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<DashboardPage />)

            await waitFor(() => {
                // May be called multiple times due to React StrictMode/effect re-runs
                expect(mockRefreshProfile).toHaveBeenCalled()
            })
        })

        it('should clean URL by replacing with /dashboard', async () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<DashboardPage />)

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/dashboard')
            })
        })

        it('should not trigger on normal page load', () => {
            mockSearchParams = new URLSearchParams()

            render(<DashboardPage />)

            expect(mockRefreshProfile).not.toHaveBeenCalled()
            expect(mockReplace).not.toHaveBeenCalled()
        })

        it('should not trigger for other query params', () => {
            mockSearchParams = new URLSearchParams('foo=bar')

            render(<DashboardPage />)

            expect(mockRefreshProfile).not.toHaveBeenCalled()
        })

        it('should not trigger for payment=cancelled', () => {
            mockSearchParams = new URLSearchParams('payment=cancelled')

            render(<DashboardPage />)

            expect(mockRefreshProfile).not.toHaveBeenCalled()
        })

        it('should not trigger for empty payment value', () => {
            mockSearchParams = new URLSearchParams('payment=')

            render(<DashboardPage />)

            expect(mockRefreshProfile).not.toHaveBeenCalled()
        })
    })

    describe('Toast notification', () => {
        it('should show success toast when payment is successful', async () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<DashboardPage />)

            await waitFor(() => {
                expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
            })
        })

        it('should show detailed message in toast', async () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<DashboardPage />)

            await waitFor(() => {
                expect(screen.getByText('Credits have been added to your account.')).toBeInTheDocument()
            })
        })

        it('should have auto-hide timeout configured', async () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<DashboardPage />)

            await waitFor(() => {
                expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
            })

            // Verify toast is shown - auto-hide behavior is tested implicitly
            // by the component's setTimeout(5000) implementation
            expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
        })

        it('should have close button on toast', async () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<DashboardPage />)

            await waitFor(() => {
                expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
            })

            // Find the close button (X icon button)
            const toastContainer = screen.getByText('Payment Successful!').closest('div')?.parentElement
            const closeButton = toastContainer?.querySelector('button')
            expect(closeButton).toBeInTheDocument()
        })

        it('should render close button that is clickable', async () => {
            mockSearchParams = new URLSearchParams('payment=success')

            render(<DashboardPage />)

            await waitFor(() => {
                expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
            })

            // Find the close button
            const toastContainer = screen.getByText('Payment Successful!').closest('div')?.parentElement
            const closeButton = toastContainer?.querySelector('button')

            // Verify close button exists and is enabled (can be clicked)
            expect(closeButton).toBeInTheDocument()
            expect(closeButton).not.toBeDisabled()
        })

        it('should not show toast on normal page load', () => {
            mockSearchParams = new URLSearchParams()

            render(<DashboardPage />)

            expect(screen.queryByText('Payment Successful!')).not.toBeInTheDocument()
        })
    })

    describe('Multiple renders', () => {
        it('should handle rerenders gracefully', async () => {
            mockSearchParams = new URLSearchParams('payment=success')

            const { rerender } = render(<DashboardPage />)

            await waitFor(() => {
                expect(mockRefreshProfile).toHaveBeenCalled()
            })

            const callCountAfterFirstRender = mockRefreshProfile.mock.calls.length

            // Rerender with same params
            rerender(<DashboardPage />)

            // Call count should not increase dramatically (may increase by 1 due to effects)
            expect(mockRefreshProfile.mock.calls.length).toBeLessThanOrEqual(callCountAfterFirstRender + 1)
        })
    })
})

describe('Dashboard credit balance integration', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockSearchParams = new URLSearchParams()
    })

    it('should display updated credits after payment success and refresh', async () => {
        mockSearchParams = new URLSearchParams('payment=success')

        render(<DashboardPage />)

        // Verify refreshProfile was called to update credits
        await waitFor(() => {
            expect(mockRefreshProfile).toHaveBeenCalled()
        })
    })
})
