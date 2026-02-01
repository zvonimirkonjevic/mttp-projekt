import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/app/components/auth/LoginForm'
import React from 'react'

// Mock signInWithOAuth function
const mockSignInWithOAuth = jest.fn()

// Store search params for testing
let mockSearchParams = new URLSearchParams()

// Mock dependencies
jest.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
}))

jest.mock('@/utils/supabase/client', () => ({
    createClient: () => ({
        auth: {
            signInWithOAuth: mockSignInWithOAuth,
        },
    }),
}))

// Store useActionState mock for manipulation
let mockActionState: [{ error?: string }, () => void] = [{}, jest.fn()]

// Mock useActionState from React
jest.mock('react', () => {
    const actual = jest.requireActual('react')
    return {
        ...actual,
        useActionState: jest.fn().mockImplementation(() => mockActionState),
    }
})

// Mock useFormStatus from react-dom
let mockFormPending = false
jest.mock('react-dom', () => {
    const actual = jest.requireActual('react-dom')
    return {
        ...actual,
        useFormStatus: () => ({ pending: mockFormPending }),
    }
})

// Mock SubtleTransitionLink
jest.mock('@/app/components/SubtleTransitionLink', () => {
    return function MockLink({ children, href, className }: {
        children: React.ReactNode
        href: string
        className?: string
    }) {
        return <a href={href} className={className}>{children}</a>
    }
})

describe('LoginForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockSearchParams = new URLSearchParams()
        mockActionState = [{}, jest.fn()]
        mockFormPending = false
        mockSignInWithOAuth.mockResolvedValue({ error: null })

        // Mock window.location.origin
        Object.defineProperty(window, 'location', {
            value: { origin: 'http://localhost:3000' },
            writable: true,
        })
    })

    describe('Basic rendering', () => {
        it('should render the login form', () => {
            render(<LoginForm />)

            expect(screen.getByLabelText('E-Mail')).toBeInTheDocument()
            expect(screen.getByLabelText('Password')).toBeInTheDocument()
        })

        it('should render the brand name', () => {
            render(<LoginForm />)

            expect(screen.getByText('flashslides')).toBeInTheDocument()
        })

        it('should render the login button', () => {
            render(<LoginForm />)

            expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
        })

        it('should render Google sign-in button', () => {
            render(<LoginForm />)

            expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument()
        })

        it('should render forgot password link', () => {
            render(<LoginForm />)

            const forgotLink = screen.getByRole('link', { name: /Forgot password/i })
            expect(forgotLink).toBeInTheDocument()
            expect(forgotLink).toHaveAttribute('href', '/forgot-password')
        })

        it('should render sign up link', () => {
            render(<LoginForm />)

            const signupLink = screen.getByRole('link', { name: /Sign up/i })
            expect(signupLink).toBeInTheDocument()
            expect(signupLink).toHaveAttribute('href', '/signup')
        })

        it('should have required email field', () => {
            render(<LoginForm />)

            const emailInput = screen.getByLabelText('E-Mail')
            expect(emailInput).toHaveAttribute('required')
            expect(emailInput).toHaveAttribute('type', 'email')
        })

        it('should have required password field', () => {
            render(<LoginForm />)

            const passwordInput = screen.getByLabelText('Password')
            expect(passwordInput).toHaveAttribute('required')
            expect(passwordInput).toHaveAttribute('type', 'password')
        })
    })

    describe('Form interactions', () => {
        it('should allow typing in email field', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)

            const emailInput = screen.getByLabelText('E-Mail')
            await user.type(emailInput, 'test@example.com')

            expect(emailInput).toHaveValue('test@example.com')
        })

        it('should allow typing in password field', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)

            const passwordInput = screen.getByLabelText('Password')
            await user.type(passwordInput, 'password123')

            expect(passwordInput).toHaveValue('password123')
        })
    })

    describe('Error display', () => {
        it('should display login action error', () => {
            mockActionState = [{ error: 'Invalid credentials' }, jest.fn()]

            render(<LoginForm />)

            expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
        })

        it('should display OAuth error from URL params', () => {
            mockSearchParams = new URLSearchParams('error=oauth_failed&message=Access%20denied')

            render(<LoginForm />)

            expect(screen.getByText('Access denied')).toBeInTheDocument()
        })

        it('should display generic OAuth error when message is missing', () => {
            mockSearchParams = new URLSearchParams('error=oauth_failed')

            render(<LoginForm />)

            expect(screen.getByText('Google sign-in failed')).toBeInTheDocument()
        })

        it('should not display error when error param is not oauth_failed', () => {
            mockSearchParams = new URLSearchParams('error=some_other_error')

            render(<LoginForm />)

            expect(screen.queryByText('Google sign-in failed')).not.toBeInTheDocument()
        })

        it('should display action error over OAuth error', () => {
            mockActionState = [{ error: 'Action error' }, jest.fn()]
            mockSearchParams = new URLSearchParams('error=oauth_failed&message=OAuth%20error')

            render(<LoginForm />)

            // Both errors are checked with ||, action error comes first
            expect(screen.getByText('Action error')).toBeInTheDocument()
        })
    })

    describe('Google OAuth sign-in', () => {
        it('should call signInWithOAuth when Google button is clicked', async () => {
            const user = userEvent.setup()
            render(<LoginForm />)

            const googleButton = screen.getByRole('button', { name: /Continue with Google/i })
            await user.click(googleButton)

            expect(mockSignInWithOAuth).toHaveBeenCalledWith({
                provider: 'google',
                options: { redirectTo: 'http://localhost:3000/auth/callback' },
            })
        })

        it('should show loading state while Google sign-in is in progress', async () => {
            const user = userEvent.setup()
            // Make signInWithOAuth hang
            mockSignInWithOAuth.mockImplementation(() => new Promise(() => {}))

            render(<LoginForm />)

            const googleButton = screen.getByRole('button', { name: /Continue with Google/i })
            await user.click(googleButton)

            expect(screen.getByRole('button', { name: /Signing in.../i })).toBeInTheDocument()
        })

        it('should display error when Google sign-in fails', async () => {
            const user = userEvent.setup()
            mockSignInWithOAuth.mockResolvedValue({
                error: { message: 'Popup closed by user' },
            })

            render(<LoginForm />)

            const googleButton = screen.getByRole('button', { name: /Continue with Google/i })
            await user.click(googleButton)

            await waitFor(() => {
                expect(screen.getByText('Popup closed by user')).toBeInTheDocument()
            })
        })

        it('should clear OAuth error when Google button is clicked again', async () => {
            const user = userEvent.setup()
            mockSignInWithOAuth
                .mockResolvedValueOnce({ error: { message: 'First error' } })
                .mockImplementation(() => new Promise(() => {}))

            render(<LoginForm />)

            const googleButton = screen.getByRole('button', { name: /Continue with Google/i })

            // First click - causes error
            await user.click(googleButton)
            await waitFor(() => {
                expect(screen.getByText('First error')).toBeInTheDocument()
            })

            // Second click - should clear error
            await user.click(googleButton)
            await waitFor(() => {
                expect(screen.queryByText('First error')).not.toBeInTheDocument()
            })
        })

        it('should disable Google button while loading', async () => {
            const user = userEvent.setup()
            mockSignInWithOAuth.mockImplementation(() => new Promise(() => {}))

            render(<LoginForm />)

            const googleButton = screen.getByRole('button', { name: /Continue with Google/i })
            await user.click(googleButton)

            expect(screen.getByRole('button', { name: /Signing in.../i })).toBeDisabled()
        })
    })

    describe('Form submission states', () => {
        it('should show "Signing In..." when form is pending', () => {
            mockFormPending = true

            render(<LoginForm />)

            expect(screen.getByRole('button', { name: /Signing In.../i })).toBeInTheDocument()
        })

        it('should disable submit button when form is pending', () => {
            mockFormPending = true

            render(<LoginForm />)

            expect(screen.getByRole('button', { name: /Signing In.../i })).toBeDisabled()
        })
    })

    describe('Accessibility', () => {
        it('should have proper form structure', () => {
            render(<LoginForm />)

            const form = document.querySelector('form')
            expect(form).toBeInTheDocument()
        })

        it('should have labels associated with inputs', () => {
            render(<LoginForm />)

            const emailInput = screen.getByLabelText('E-Mail')
            const passwordInput = screen.getByLabelText('Password')

            expect(emailInput).toHaveAttribute('id', 'email')
            expect(passwordInput).toHaveAttribute('id', 'password')
        })

        it('should have appropriate placeholders', () => {
            render(<LoginForm />)

            expect(screen.getByPlaceholderText('E-Mail')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
        })
    })
})
