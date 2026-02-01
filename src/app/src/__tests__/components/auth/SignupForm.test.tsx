import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupForm from '@/app/components/auth/SignupForm'
import React from 'react'

// Mock signInWithOAuth function
const mockSignInWithOAuth = jest.fn()

// Mock dependencies
jest.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/utils/supabase/client', () => ({
    createClient: () => ({
        auth: {
            signInWithOAuth: mockSignInWithOAuth,
        },
    }),
}))

// Store useActionState mock for manipulation
type SignupState = { error?: string; success?: boolean; message?: string }
let mockActionState: [SignupState, () => void, boolean] = [{}, jest.fn(), false]

// Mock useActionState from React
jest.mock('react', () => {
    const actual = jest.requireActual('react')
    return {
        ...actual,
        useActionState: jest.fn().mockImplementation(() => mockActionState),
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

describe('SignupForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockActionState = [{}, jest.fn(), false]
        mockSignInWithOAuth.mockResolvedValue({ error: null })

        // Mock window.location.origin
        Object.defineProperty(window, 'location', {
            value: { origin: 'http://localhost:3000' },
            writable: true,
        })
    })

    describe('Basic rendering', () => {
        it('should render all form fields', () => {
            render(<SignupForm />)

            expect(screen.getByLabelText('First Name')).toBeInTheDocument()
            expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
            expect(screen.getByLabelText('E-Mail')).toBeInTheDocument()
            expect(screen.getByLabelText('Password')).toBeInTheDocument()
            expect(screen.getByLabelText('Repeat Password')).toBeInTheDocument()
        })

        it('should render the brand name', () => {
            render(<SignupForm />)

            expect(screen.getByText('flashslides')).toBeInTheDocument()
        })

        it('should render the signup button', () => {
            render(<SignupForm />)

            expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
        })

        it('should render Google sign-in button', () => {
            render(<SignupForm />)

            expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument()
        })

        it('should render login link for existing users', () => {
            render(<SignupForm />)

            const loginLink = screen.getByRole('link', { name: /Log in/i })
            expect(loginLink).toBeInTheDocument()
            expect(loginLink).toHaveAttribute('href', '/login')
        })

        it('should render terms acceptance checkbox', () => {
            render(<SignupForm />)

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).toBeInTheDocument()
        })

        it('should have required name fields', () => {
            render(<SignupForm />)

            expect(screen.getByLabelText('First Name')).toHaveAttribute('required')
            expect(screen.getByLabelText('Last Name')).toHaveAttribute('required')
        })

        it('should render Terms of Use and Privacy Policy links', () => {
            render(<SignupForm />)

            expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms')
            expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
        })
    })

    describe('Form interactions', () => {
        it('should allow typing in all fields', async () => {
            const user = userEvent.setup()
            render(<SignupForm />)

            const firstName = screen.getByLabelText('First Name')
            const lastName = screen.getByLabelText('Last Name')
            const email = screen.getByLabelText('E-Mail')
            const password = screen.getByLabelText('Password')
            const repeatPassword = screen.getByLabelText('Repeat Password')

            await user.type(firstName, 'John')
            await user.type(lastName, 'Doe')
            await user.type(email, 'john@example.com')
            await user.type(password, 'password123')
            await user.type(repeatPassword, 'password123')

            expect(firstName).toHaveValue('John')
            expect(lastName).toHaveValue('Doe')
            expect(email).toHaveValue('john@example.com')
            expect(password).toHaveValue('password123')
            expect(repeatPassword).toHaveValue('password123')
        })

        it('should allow checking the terms checkbox', async () => {
            const user = userEvent.setup()
            render(<SignupForm />)

            const checkbox = screen.getByRole('checkbox')
            expect(checkbox).not.toBeChecked()

            await user.click(checkbox)

            expect(checkbox).toBeChecked()
        })
    })

    describe('Success state', () => {
        it('should show success message after successful signup', () => {
            mockActionState = [{ success: true, message: 'Check your email!' }, jest.fn(), false]

            render(<SignupForm />)

            expect(screen.getByText('Check your email')).toBeInTheDocument()
            expect(screen.getByText(/We've sent a confirmation link to your email/i)).toBeInTheDocument()
        })

        it('should hide form fields on success', () => {
            mockActionState = [{ success: true }, jest.fn(), false]

            render(<SignupForm />)

            expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('E-Mail')).not.toBeInTheDocument()
            expect(screen.queryByRole('button', { name: 'Sign Up' })).not.toBeInTheDocument()
        })

        it('should hide Google sign-in button on success', () => {
            mockActionState = [{ success: true }, jest.fn(), false]

            render(<SignupForm />)

            expect(screen.queryByRole('button', { name: /Continue with Google/i })).not.toBeInTheDocument()
        })

        it('should show Back to Login link on success', () => {
            mockActionState = [{ success: true }, jest.fn(), false]

            render(<SignupForm />)

            const backLink = screen.getByRole('link', { name: /Back to Login/i })
            expect(backLink).toHaveAttribute('href', '/login')
        })

        it('should show email verification instructions on success', () => {
            mockActionState = [{ success: true }, jest.fn(), false]

            render(<SignupForm />)

            expect(screen.getByText(/check your spam folder/i)).toBeInTheDocument()
        })
    })

    describe('Error display', () => {
        it('should display signup action error', () => {
            mockActionState = [{ error: 'User already registered' }, jest.fn(), false]

            render(<SignupForm />)

            expect(screen.getByText('User already registered')).toBeInTheDocument()
        })

        it('should display validation error', () => {
            mockActionState = [{ error: 'Passwords do not match' }, jest.fn(), false]

            render(<SignupForm />)

            expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
        })
    })

    describe('Google OAuth sign-in', () => {
        it('should call signInWithOAuth when Google button is clicked', async () => {
            const user = userEvent.setup()
            render(<SignupForm />)

            const googleButton = screen.getByRole('button', { name: /Continue with Google/i })
            await user.click(googleButton)

            expect(mockSignInWithOAuth).toHaveBeenCalledWith({
                provider: 'google',
                options: { redirectTo: 'http://localhost:3000/auth/callback' },
            })
        })

        it('should show loading state while Google sign-in is in progress', async () => {
            const user = userEvent.setup()
            mockSignInWithOAuth.mockImplementation(() => new Promise(() => {}))

            render(<SignupForm />)

            const googleButton = screen.getByRole('button', { name: /Continue with Google/i })
            await user.click(googleButton)

            expect(screen.getByRole('button', { name: /Signing in.../i })).toBeInTheDocument()
        })

        it('should display error when Google sign-in fails', async () => {
            const user = userEvent.setup()
            mockSignInWithOAuth.mockResolvedValue({
                error: { message: 'OAuth provider error' },
            })

            render(<SignupForm />)

            const googleButton = screen.getByRole('button', { name: /Continue with Google/i })
            await user.click(googleButton)

            await waitFor(() => {
                expect(screen.getByText('OAuth provider error')).toBeInTheDocument()
            })
        })

        it('should clear Google error when button is clicked again', async () => {
            const user = userEvent.setup()
            mockSignInWithOAuth
                .mockResolvedValueOnce({ error: { message: 'First error' } })
                .mockImplementation(() => new Promise(() => {}))

            render(<SignupForm />)

            const googleButton = screen.getByRole('button', { name: /Continue with Google/i })

            await user.click(googleButton)
            await waitFor(() => {
                expect(screen.getByText('First error')).toBeInTheDocument()
            })

            await user.click(googleButton)
            await waitFor(() => {
                expect(screen.queryByText('First error')).not.toBeInTheDocument()
            })
        })

        it('should disable Google button while loading', async () => {
            const user = userEvent.setup()
            mockSignInWithOAuth.mockImplementation(() => new Promise(() => {}))

            render(<SignupForm />)

            const googleButton = screen.getByRole('button', { name: /Continue with Google/i })
            await user.click(googleButton)

            expect(screen.getByRole('button', { name: /Signing in.../i })).toBeDisabled()
        })
    })

    describe('Form submission states', () => {
        it('should show "Signing up..." when form is pending', () => {
            mockActionState = [{}, jest.fn(), true]

            render(<SignupForm />)

            expect(screen.getByRole('button', { name: /Signing up.../i })).toBeInTheDocument()
        })

        it('should disable submit button when form is pending', () => {
            mockActionState = [{}, jest.fn(), true]

            render(<SignupForm />)

            expect(screen.getByRole('button', { name: /Signing up.../i })).toBeDisabled()
        })

        it('should disable all inputs when form is pending', () => {
            mockActionState = [{}, jest.fn(), true]

            render(<SignupForm />)

            expect(screen.getByLabelText('First Name')).toBeDisabled()
            expect(screen.getByLabelText('Last Name')).toBeDisabled()
            expect(screen.getByLabelText('E-Mail')).toBeDisabled()
            expect(screen.getByLabelText('Password')).toBeDisabled()
            expect(screen.getByLabelText('Repeat Password')).toBeDisabled()
            expect(screen.getByRole('checkbox')).toBeDisabled()
        })

        it('should disable Google button when form is pending', () => {
            mockActionState = [{}, jest.fn(), true]

            render(<SignupForm />)

            expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeDisabled()
        })
    })

    describe('Accessibility', () => {
        it('should have proper form structure', () => {
            render(<SignupForm />)

            const form = document.querySelector('form')
            expect(form).toBeInTheDocument()
        })

        it('should have labels associated with inputs', () => {
            render(<SignupForm />)

            expect(screen.getByLabelText('First Name')).toHaveAttribute('id', 'firstName')
            expect(screen.getByLabelText('Last Name')).toHaveAttribute('id', 'lastName')
            expect(screen.getByLabelText('E-Mail')).toHaveAttribute('id', 'email')
            expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'password')
            expect(screen.getByLabelText('Repeat Password')).toHaveAttribute('id', 'confirmPassword')
        })

        it('should have appropriate input types', () => {
            render(<SignupForm />)

            expect(screen.getByLabelText('First Name')).toHaveAttribute('type', 'text')
            expect(screen.getByLabelText('Last Name')).toHaveAttribute('type', 'text')
            expect(screen.getByLabelText('E-Mail')).toHaveAttribute('type', 'email')
            expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
            expect(screen.getByLabelText('Repeat Password')).toHaveAttribute('type', 'password')
        })
    })
})
