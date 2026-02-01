/**
 * Tests for Sidebar component - Credit balance display and user profile
 * Tests credit display, user info, navigation, and logout functionality
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock GlobalTransitionContext
const mockNavigateWithTransition = jest.fn()
jest.mock('@/app/dashboard/contexts/GlobalTransitionContext', () => ({
    useGlobalTransition: () => ({
        navigateWithTransition: mockNavigateWithTransition,
    }),
}))

// Mock UserContext
let mockProfile: any = {
    first_name: 'John',
    last_name: 'Doe',
    credits_balance: 500,
    stripe_customer_id: 'cus_test123',
    avatar_url: null,
}
let mockUser: any = {
    email: 'john@example.com',
}
let mockIsLoading = false

jest.mock('@/app/contexts/UserContext', () => ({
    useUser: () => ({
        profile: mockProfile,
        user: mockUser,
        isLoading: mockIsLoading,
    }),
}))

// Mock logoutAction
const mockLogoutAction = jest.fn()
jest.mock('@/app/actions/auth', () => ({
    logoutAction: () => mockLogoutAction(),
}))

// Mock crypto.randomUUID
Object.defineProperty(crypto, 'randomUUID', {
    value: () => 'test-uuid-1234',
})

// Import after mocks
import Sidebar from '@/app/components/dashboard/Sidebar'

describe('Sidebar', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockProfile = {
            first_name: 'John',
            last_name: 'Doe',
            credits_balance: 500,
            stripe_customer_id: 'cus_test123',
            avatar_url: null,
        }
        mockUser = {
            email: 'john@example.com',
        }
        mockIsLoading = false
    })

    describe('Credit balance display', () => {
        it('should display the current credit balance', () => {
            render(<Sidebar />)

            expect(screen.getByText('500')).toBeInTheDocument()
        })

        it('should display "Credits remaining" label', () => {
            render(<Sidebar />)

            expect(screen.getByText('Credits remaining')).toBeInTheDocument()
        })

        it('should display different credit balances', () => {
            mockProfile.credits_balance = 1250

            render(<Sidebar />)

            expect(screen.getByText('1250')).toBeInTheDocument()
        })

        it('should display 0 when credits_balance is 0', () => {
            mockProfile.credits_balance = 0

            render(<Sidebar />)

            expect(screen.getByText('0')).toBeInTheDocument()
        })

        it('should display loading indicator when isLoading is true', () => {
            mockIsLoading = true

            render(<Sidebar />)

            expect(screen.getByText('...')).toBeInTheDocument()
        })

        it('should display 0 when profile is null', () => {
            mockProfile = null

            render(<Sidebar />)

            expect(screen.getByText('0')).toBeInTheDocument()
        })

        it('should link credit display to billing page', () => {
            render(<Sidebar />)

            const creditsLink = screen.getByText('Credits remaining').closest('a')
            expect(creditsLink).toHaveAttribute('href', '/settings/billing')
        })
    })

    describe('User profile display', () => {
        it('should display user full name', () => {
            render(<Sidebar />)

            expect(screen.getByText('John Doe')).toBeInTheDocument()
        })

        it('should display user initials when no avatar', () => {
            render(<Sidebar />)

            expect(screen.getByText('JD')).toBeInTheDocument()
        })

        it('should display avatar image when avatar_url is present', () => {
            mockProfile.avatar_url = 'https://example.com/avatar.jpg'

            render(<Sidebar />)

            const avatarImg = screen.getByRole('img', { name: 'John Doe' })
            expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg')
        })

        it('should display email username when no profile name', () => {
            mockProfile.first_name = null
            mockProfile.last_name = null

            render(<Sidebar />)

            expect(screen.getByText('john')).toBeInTheDocument()
        })

        it('should display first name only when last name is missing', () => {
            mockProfile.last_name = null

            render(<Sidebar />)

            expect(screen.getByText('John')).toBeInTheDocument()
        })

        it('should display "Pro Plan" badge', () => {
            render(<Sidebar />)

            expect(screen.getByText('Pro Plan')).toBeInTheDocument()
        })
    })

    describe('Profile dropdown menu', () => {
        it('should open profile menu when clicked', async () => {
            const user = userEvent.setup()

            render(<Sidebar />)

            const profileButton = screen.getByText('John Doe').closest('button')
            await user.click(profileButton!)

            expect(screen.getByText('Account settings')).toBeInTheDocument()
        })

        it('should show user email in profile menu', async () => {
            const user = userEvent.setup()

            render(<Sidebar />)

            const profileButton = screen.getByText('John Doe').closest('button')
            await user.click(profileButton!)

            expect(screen.getByText('john@example.com')).toBeInTheDocument()
        })

        it('should have link to account settings', async () => {
            const user = userEvent.setup()

            render(<Sidebar />)

            const profileButton = screen.getByText('John Doe').closest('button')
            await user.click(profileButton!)

            const settingsLink = screen.getByRole('link', { name: /Account settings/i })
            expect(settingsLink).toHaveAttribute('href', '/settings/details')
        })

        it('should have logout button', async () => {
            const user = userEvent.setup()

            render(<Sidebar />)

            const profileButton = screen.getByText('John Doe').closest('button')
            await user.click(profileButton!)

            expect(screen.getByRole('button', { name: /Log out/i })).toBeInTheDocument()
        })

        it('should call logoutAction when logout is clicked', async () => {
            const user = userEvent.setup()

            render(<Sidebar />)

            const profileButton = screen.getByText('John Doe').closest('button')
            await user.click(profileButton!)

            const logoutButton = screen.getByRole('button', { name: /Log out/i })
            await user.click(logoutButton)

            expect(mockLogoutAction).toHaveBeenCalled()
        })

        it('should close menu when clicking outside', async () => {
            const user = userEvent.setup()

            render(<Sidebar />)

            const profileButton = screen.getByText('John Doe').closest('button')
            await user.click(profileButton!)

            expect(screen.getByText('Account settings')).toBeInTheDocument()

            // Click outside
            await user.click(document.body)

            await waitFor(() => {
                expect(screen.queryByRole('link', { name: /Account settings/i })).not.toBeInTheDocument()
            })
        })

        it('should close menu on Escape key', async () => {
            const user = userEvent.setup()

            render(<Sidebar />)

            const profileButton = screen.getByText('John Doe').closest('button')
            await user.click(profileButton!)

            expect(screen.getByText('Account settings')).toBeInTheDocument()

            await user.keyboard('{Escape}')

            await waitFor(() => {
                expect(screen.queryByRole('link', { name: /Account settings/i })).not.toBeInTheDocument()
            })
        })

        it('should toggle menu on repeated clicks', async () => {
            const user = userEvent.setup()

            render(<Sidebar />)

            const profileButton = screen.getByText('John Doe').closest('button')

            // Open
            await user.click(profileButton!)
            expect(screen.getByText('Account settings')).toBeInTheDocument()

            // Close
            await user.click(profileButton!)
            await waitFor(() => {
                expect(screen.queryByRole('link', { name: /Account settings/i })).not.toBeInTheDocument()
            })
        })
    })

    describe('Navigation', () => {
        it('should have New presentation button', () => {
            render(<Sidebar />)

            expect(screen.getByRole('button', { name: /New presentation/i })).toBeInTheDocument()
        })

        it('should navigate to new presentation on button click', async () => {
            const user = userEvent.setup()

            render(<Sidebar />)

            const newPresentationButton = screen.getByRole('button', { name: /New presentation/i })
            await user.click(newPresentationButton)

            expect(mockNavigateWithTransition).toHaveBeenCalledWith('/presentations/test-uuid-1234')
        })

        it('should have Presentations section', () => {
            render(<Sidebar />)

            expect(screen.getByText('Presentations')).toBeInTheDocument()
        })

        it('should have All presentations link', () => {
            render(<Sidebar />)

            const allPresentationsLink = screen.getByRole('link', { name: /All presentations/i })
            expect(allPresentationsLink).toHaveAttribute('href', '/dashboard')
        })

        it('should toggle Presentations section', async () => {
            const user = userEvent.setup()

            render(<Sidebar />)

            // Initially open
            expect(screen.getByRole('link', { name: /All presentations/i })).toBeInTheDocument()

            // Click to close
            const presentationsToggle = screen.getByText('Presentations').closest('div')
            await user.click(presentationsToggle!)

            await waitFor(() => {
                expect(screen.queryByRole('link', { name: /All presentations/i })).not.toBeInTheDocument()
            })

            // Click to open again
            await user.click(presentationsToggle!)

            await waitFor(() => {
                expect(screen.getByRole('link', { name: /All presentations/i })).toBeInTheDocument()
            })
        })

        it('should show Templates as coming soon', () => {
            render(<Sidebar />)

            expect(screen.getByText('Templates')).toBeInTheDocument()
            const soonBadges = screen.getAllByText('Soon')
            expect(soonBadges.length).toBeGreaterThanOrEqual(1)
        })

        it('should show API Keys as coming soon', () => {
            render(<Sidebar />)

            expect(screen.getByText('API Keys')).toBeInTheDocument()
        })
    })

    describe('Initials generation', () => {
        it('should generate initials from first and last name', () => {
            mockProfile.first_name = 'Jane'
            mockProfile.last_name = 'Smith'

            render(<Sidebar />)

            expect(screen.getByText('JS')).toBeInTheDocument()
        })

        it('should use first two chars of display name when no full name', () => {
            mockProfile.first_name = null
            mockProfile.last_name = null
            mockUser.email = 'testuser@example.com'

            render(<Sidebar />)

            expect(screen.getByText('TE')).toBeInTheDocument()
        })

        it('should handle single character names', () => {
            mockProfile.first_name = 'A'
            mockProfile.last_name = 'B'

            render(<Sidebar />)

            expect(screen.getByText('AB')).toBeInTheDocument()
        })
    })

    describe('Edge cases', () => {
        it('should handle missing user email', () => {
            mockUser.email = null

            render(<Sidebar />)

            // Should still render without error
            expect(screen.getByText('John Doe')).toBeInTheDocument()
        })

        it('should display "User" when no profile or email', () => {
            mockProfile.first_name = null
            mockProfile.last_name = null
            mockUser.email = null

            render(<Sidebar />)

            expect(screen.getByText('User')).toBeInTheDocument()
        })

        it('should handle very large credit balances', () => {
            mockProfile.credits_balance = 999999

            render(<Sidebar />)

            expect(screen.getByText('999999')).toBeInTheDocument()
        })
    })
})
