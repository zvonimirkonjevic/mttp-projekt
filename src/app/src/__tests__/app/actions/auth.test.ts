/**
 * Tests for auth server actions
 * Tests loginAction, signupAction, and logoutAction
 */

import { loginAction, signupAction, logoutAction } from '@/app/actions/auth'

// Mock redirect - throws a NEXT_REDIRECT error like Next.js does
class RedirectError extends Error {
    digest: string
    constructor(url: string) {
        super(`NEXT_REDIRECT:${url}`)
        this.digest = `NEXT_REDIRECT;replace;${url}`
    }
}

const mockRedirect = jest.fn().mockImplementation((url: string) => {
    throw new RedirectError(url)
})

jest.mock('next/navigation', () => ({
    redirect: (url: string) => mockRedirect(url),
}))

// Mock auth adapter
const mockLogin = jest.fn()
const mockLogout = jest.fn()
jest.mock('@/lib/auth/supabase-adapter', () => ({
    authAdapter: {
        login: (...args: unknown[]) => mockLogin(...args),
        logout: (...args: unknown[]) => mockLogout(...args),
    },
}))

// Mock Supabase server client
const mockSignUp = jest.fn()
const mockSignOut = jest.fn()
jest.mock('@/utils/supabase/server', () => ({
    createClient: jest.fn().mockImplementation(() =>
        Promise.resolve({
            auth: {
                signUp: mockSignUp,
                signOut: mockSignOut,
            },
        })
    ),
}))

// Mock fetch for FastAPI calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Auth Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        process.env.API_CONTAINER_URL = 'http://api:3001'
    })

    describe('loginAction', () => {
        const createFormData = (email: string, password: string): FormData => {
            const formData = new FormData()
            formData.append('email', email)
            formData.append('password', password)
            return formData
        }

        it('should return error for invalid email format', async () => {
            const formData = createFormData('invalid-email', 'password123')

            const result = await loginAction({}, formData)

            expect(result.error).toBe('Invalid email or password format.')
        })

        it('should return error for empty password', async () => {
            const formData = createFormData('test@example.com', '')

            const result = await loginAction({}, formData)

            expect(result.error).toBe('Invalid email or password format.')
        })

        it('should return error when auth adapter fails', async () => {
            mockLogin.mockResolvedValue({
                success: false,
                error: 'Invalid credentials',
            })

            const formData = createFormData('test@example.com', 'password123')

            const result = await loginAction({}, formData)

            expect(result.error).toBe('Invalid credentials')
        })

        it('should return generic error when auth adapter returns no token', async () => {
            mockLogin.mockResolvedValue({
                success: true,
                token: null,
            })

            const formData = createFormData('test@example.com', 'password123')

            const result = await loginAction({}, formData)

            expect(result.error).toBe('Authentication failed')
        })

        it('should sync with FastAPI after successful auth', async () => {
            mockLogin.mockResolvedValue({
                success: true,
                token: 'mock-token',
                user: {
                    email: 'test@example.com',
                    first_name: 'John',
                    last_name: 'Doe',
                },
            })
            mockFetch.mockResolvedValue({ ok: true })

            const formData = createFormData('test@example.com', 'password123')

            try {
                await loginAction({}, formData)
            } catch (e) {
                // Expected redirect
            }

            expect(mockFetch).toHaveBeenCalledWith(
                'http://api:3001/authenticate-jwt',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer mock-token',
                    }),
                })
            )
        })

        it('should include full_name in FastAPI sync', async () => {
            mockLogin.mockResolvedValue({
                success: true,
                token: 'mock-token',
                user: {
                    email: 'test@example.com',
                    full_name: 'Full Name User',
                },
            })
            mockFetch.mockResolvedValue({ ok: true })

            const formData = createFormData('test@example.com', 'password123')

            try {
                await loginAction({}, formData)
            } catch (e) {
                // Expected redirect
            }

            const fetchCall = mockFetch.mock.calls[0]
            const body = JSON.parse(fetchCall[1].body)
            expect(body.full_name).toBe('Full Name User')
        })

        it('should construct full_name from first_name and last_name', async () => {
            mockLogin.mockResolvedValue({
                success: true,
                token: 'mock-token',
                user: {
                    email: 'test@example.com',
                    first_name: 'Jane',
                    last_name: 'Smith',
                },
            })
            mockFetch.mockResolvedValue({ ok: true })

            const formData = createFormData('test@example.com', 'password123')

            try {
                await loginAction({}, formData)
            } catch (e) {
                // Expected redirect
            }

            const fetchCall = mockFetch.mock.calls[0]
            const body = JSON.parse(fetchCall[1].body)
            expect(body.full_name).toBe('Jane Smith')
        })

        it('should redirect to dashboard on success', async () => {
            mockLogin.mockResolvedValue({
                success: true,
                token: 'mock-token',
                user: { email: 'test@example.com' },
            })
            mockFetch.mockResolvedValue({ ok: true })

            const formData = createFormData('test@example.com', 'password123')

            await expect(loginAction({}, formData)).rejects.toThrow('NEXT_REDIRECT')
            expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
        })

        it('should return suspended account error on 403 from FastAPI', async () => {
            mockLogin.mockResolvedValue({
                success: true,
                token: 'mock-token',
                user: { email: 'test@example.com' },
            })
            mockFetch.mockResolvedValue({
                ok: false,
                status: 403,
                text: () => Promise.resolve('Account suspended'),
            })

            const formData = createFormData('test@example.com', 'password123')

            const result = await loginAction({}, formData)

            expect(result.error).toBe('Your account has been suspended.')
            expect(mockLogout).toHaveBeenCalled()
        })

        it('should return service unavailable error on other FastAPI errors', async () => {
            mockLogin.mockResolvedValue({
                success: true,
                token: 'mock-token',
                user: { email: 'test@example.com' },
            })
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                text: () => Promise.resolve('Internal server error'),
            })

            const formData = createFormData('test@example.com', 'password123')

            const result = await loginAction({}, formData)

            expect(result.error).toBe('Service temporarily unavailable. Please try again.')
            expect(mockLogout).toHaveBeenCalled()
        })

        it('should return system error on network failure', async () => {
            mockLogin.mockResolvedValue({
                success: true,
                token: 'mock-token',
                user: { email: 'test@example.com' },
            })
            mockFetch.mockRejectedValue(new Error('Network error'))

            const formData = createFormData('test@example.com', 'password123')

            const result = await loginAction({}, formData)

            expect(result.error).toBe('System error. Please contact support.')
            expect(mockLogout).toHaveBeenCalled()
        })

        it('should skip FastAPI sync if API_CONTAINER_URL is not set', async () => {
            delete process.env.API_CONTAINER_URL

            mockLogin.mockResolvedValue({
                success: true,
                token: 'mock-token',
                user: { email: 'test@example.com' },
            })

            const formData = createFormData('test@example.com', 'password123')

            await expect(loginAction({}, formData)).rejects.toThrow('NEXT_REDIRECT')

            expect(mockFetch).not.toHaveBeenCalled()
            expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
        })
    })

    describe('signupAction', () => {
        const createSignupFormData = (data: {
            email: string
            password: string
            confirmPassword: string
            firstName: string
            lastName: string
            termsAccepted?: boolean
            marketingConsent?: boolean
        }): FormData => {
            const formData = new FormData()
            formData.append('email', data.email)
            formData.append('password', data.password)
            formData.append('confirmPassword', data.confirmPassword)
            formData.append('firstName', data.firstName)
            formData.append('lastName', data.lastName)
            if (data.termsAccepted) formData.append('termsAccepted', 'on')
            if (data.marketingConsent) formData.append('marketingConsent', 'on')
            return formData
        }

        it('should return error for invalid email', async () => {
            const formData = createSignupFormData({
                email: 'invalid',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                termsAccepted: true,
            })

            const result = await signupAction({}, formData)

            expect(result.error).toBe('Invalid email address')
        })

        it('should return error for short password', async () => {
            const formData = createSignupFormData({
                email: 'test@example.com',
                password: 'short',
                confirmPassword: 'short',
                firstName: 'John',
                lastName: 'Doe',
                termsAccepted: true,
            })

            const result = await signupAction({}, formData)

            expect(result.error).toBe('Password must be at least 8 characters')
        })

        it('should return error for password mismatch', async () => {
            const formData = createSignupFormData({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'different123',
                firstName: 'John',
                lastName: 'Doe',
                termsAccepted: true,
            })

            const result = await signupAction({}, formData)

            expect(result.error).toBe('Passwords do not match')
        })

        it('should return error when terms not accepted', async () => {
            const formData = createSignupFormData({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                termsAccepted: false,
            })

            const result = await signupAction({}, formData)

            expect(result.error).toBe('You must accept the Terms of Service')
        })

        it('should return error for missing first name', async () => {
            const formData = createSignupFormData({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: '',
                lastName: 'Doe',
                termsAccepted: true,
            })

            const result = await signupAction({}, formData)

            expect(result.error).toBe('First name is required')
        })

        it('should return error for missing last name', async () => {
            const formData = createSignupFormData({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: '',
                termsAccepted: true,
            })

            const result = await signupAction({}, formData)

            expect(result.error).toBe('Last name is required')
        })

        it('should call Supabase signUp with correct params', async () => {
            mockSignUp.mockResolvedValue({ data: { user: {} }, error: null })

            const formData = createSignupFormData({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                termsAccepted: true,
                marketingConsent: true,
            })

            await signupAction({}, formData)

            expect(mockSignUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
                options: {
                    data: {
                        first_name: 'John',
                        last_name: 'Doe',
                        marketing_consent: true,
                    },
                },
            })
        })

        it('should return success message on successful signup', async () => {
            mockSignUp.mockResolvedValue({ data: { user: {} }, error: null })

            const formData = createSignupFormData({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                termsAccepted: true,
            })

            const result = await signupAction({}, formData)

            expect(result.success).toBe(true)
            expect(result.message).toBe('Success! Please check your email to confirm your account.')
        })

        it('should return error from Supabase', async () => {
            mockSignUp.mockResolvedValue({
                data: null,
                error: { message: 'User already registered' },
            })

            const formData = createSignupFormData({
                email: 'existing@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                termsAccepted: true,
            })

            const result = await signupAction({}, formData)

            expect(result.error).toBe('User already registered')
        })

        it('should handle marketing consent as optional', async () => {
            mockSignUp.mockResolvedValue({ data: { user: {} }, error: null })

            const formData = createSignupFormData({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                termsAccepted: true,
                marketingConsent: false,
            })

            await signupAction({}, formData)

            expect(mockSignUp).toHaveBeenCalledWith(
                expect.objectContaining({
                    options: {
                        data: expect.objectContaining({
                            marketing_consent: false,
                        }),
                    },
                })
            )
        })
    })

    describe('logoutAction', () => {
        it('should call Supabase signOut with global scope', async () => {
            mockSignOut.mockResolvedValue({ error: null })

            try {
                await logoutAction()
            } catch (e) {
                // Expected redirect
            }

            expect(mockSignOut).toHaveBeenCalledWith({ scope: 'global' })
        })

        it('should redirect to home page', async () => {
            mockSignOut.mockResolvedValue({ error: null })

            await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT')
            expect(mockRedirect).toHaveBeenCalledWith('/')
        })
    })
})
