/**
 * Tests for OAuth callback route handler
 * Tests the GET /auth/callback endpoint that handles OAuth redirects from Google
 */

// Mock NextResponse before importing anything
const mockRedirect = jest.fn()
jest.mock('next/server', () => ({
    NextResponse: {
        redirect: (url: URL) => {
            mockRedirect(url.toString())
            return { url: url.toString() }
        },
    },
}))

// Mock cookies
const mockCookiesGetAll = jest.fn().mockReturnValue([])
const mockCookiesSet = jest.fn()
jest.mock('next/headers', () => ({
    cookies: jest.fn().mockImplementation(() =>
        Promise.resolve({
            getAll: () => mockCookiesGetAll(),
            set: mockCookiesSet,
        })
    ),
}))

// Mock Supabase SSR client
const mockExchangeCodeForSession = jest.fn()
jest.mock('@supabase/ssr', () => ({
    createServerClient: jest.fn().mockImplementation(() => ({
        auth: {
            exchangeCodeForSession: mockExchangeCodeForSession,
        },
    })),
}))

// Mock fetch for backend sync
const mockFetch = jest.fn()
global.fetch = mockFetch

// Helper to create mock NextRequest-like objects
function createMockRequest(urlString: string) {
    const url = new URL(urlString)
    return {
        url: url.toString(),
        nextUrl: url,
        cookies: {
            getAll: () => [],
            set: jest.fn(),
        },
    }
}

// Import GET after mocking
import { GET } from '@/app/auth/callback/route'

describe('OAuth Callback Route', () => {
    const origin = 'http://localhost:3000'

    beforeEach(() => {
        jest.clearAllMocks()
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
        process.env.API_CONTAINER_URL = 'http://localhost:3001'
        mockFetch.mockResolvedValue({ ok: true })
    })

    describe('Error handling', () => {
        it('should redirect to login with error when OAuth error is present', async () => {
            const request = createMockRequest(`${origin}/auth/callback?error=access_denied&error_description=User%20denied%20access`)

            await GET(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(
                expect.stringContaining('/login?error=oauth_failed&message=User%20denied%20access')
            )
        })

        it('should redirect with generic message when error_description is missing', async () => {
            const request = createMockRequest(`${origin}/auth/callback?error=server_error`)

            await GET(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(
                expect.stringContaining('/login?error=oauth_failed&message=Authentication%20failed')
            )
        })

        it('should redirect to login when no code is present', async () => {
            const request = createMockRequest(`${origin}/auth/callback`)

            await GET(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(
                expect.stringContaining('/login?error=no_code')
            )
        })

        it('should redirect to login on exchange error', async () => {
            mockExchangeCodeForSession.mockResolvedValue({
                data: { session: null },
                error: { message: 'Invalid code' },
            })

            const request = createMockRequest(`${origin}/auth/callback?code=invalid-code`)

            await GET(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(
                expect.stringContaining('/login?error=oauth_failed')
            )
        })
    })

    describe('Successful OAuth flow', () => {
        const mockSession = {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
        }

        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
                full_name: 'John Doe',
                first_name: 'John',
                last_name: 'Doe',
            },
        }

        beforeEach(() => {
            mockExchangeCodeForSession.mockResolvedValue({
                data: { session: mockSession, user: mockUser },
                error: null,
            })
        })

        it('should exchange code for session', async () => {
            const request = createMockRequest(`${origin}/auth/callback?code=valid-auth-code`)

            await GET(request as any)

            expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid-auth-code')
        })

        it('should redirect to dashboard on success', async () => {
            const request = createMockRequest(`${origin}/auth/callback?code=valid-auth-code`)

            await GET(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(
                expect.stringContaining('/dashboard')
            )
        })

        it('should sync with backend after successful auth', async () => {
            const request = createMockRequest(`${origin}/auth/callback?code=valid-auth-code`)

            await GET(request as any)

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/authenticate-jwt',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer mock-access-token',
                        'Content-Type': 'application/json',
                    }),
                    body: expect.stringContaining('test@example.com'),
                })
            )
        })

        it('should include full_name in backend sync', async () => {
            const request = createMockRequest(`${origin}/auth/callback?code=valid-auth-code`)

            await GET(request as any)

            const fetchCall = mockFetch.mock.calls[0]
            const body = JSON.parse(fetchCall[1].body)
            expect(body.full_name).toBe('John Doe')
        })

        it('should construct full_name from first_name and last_name if full_name missing', async () => {
            mockExchangeCodeForSession.mockResolvedValue({
                data: {
                    session: mockSession,
                    user: {
                        ...mockUser,
                        user_metadata: {
                            first_name: 'Jane',
                            last_name: 'Smith',
                        },
                    },
                },
                error: null,
            })

            const request = createMockRequest(`${origin}/auth/callback?code=valid-auth-code`)

            await GET(request as any)

            const fetchCall = mockFetch.mock.calls[0]
            const body = JSON.parse(fetchCall[1].body)
            expect(body.full_name).toBe('Jane Smith')
        })

        it('should handle user with name metadata field', async () => {
            mockExchangeCodeForSession.mockResolvedValue({
                data: {
                    session: mockSession,
                    user: {
                        ...mockUser,
                        user_metadata: {
                            name: 'Google User Name',
                        },
                    },
                },
                error: null,
            })

            const request = createMockRequest(`${origin}/auth/callback?code=valid-auth-code`)

            await GET(request as any)

            const fetchCall = mockFetch.mock.calls[0]
            const body = JSON.parse(fetchCall[1].body)
            expect(body.full_name).toBe('Google User Name')
        })

        it('should continue to dashboard even if backend sync fails', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'))

            const request = createMockRequest(`${origin}/auth/callback?code=valid-auth-code`)

            await GET(request as any)

            // Should still redirect to dashboard
            expect(mockRedirect).toHaveBeenCalledWith(
                expect.stringContaining('/dashboard')
            )
        })

        it('should not call backend sync if API_CONTAINER_URL is not set', async () => {
            delete process.env.API_CONTAINER_URL

            const request = createMockRequest(`${origin}/auth/callback?code=valid-auth-code`)

            await GET(request as any)

            expect(mockFetch).not.toHaveBeenCalled()
            expect(mockRedirect).toHaveBeenCalledWith(
                expect.stringContaining('/dashboard')
            )
        })
    })

    describe('Edge cases', () => {
        it('should handle user with no metadata', async () => {
            mockExchangeCodeForSession.mockResolvedValue({
                data: {
                    session: { access_token: 'token' },
                    user: {
                        id: 'user-123',
                        email: 'test@example.com',
                    },
                },
                error: null,
            })

            const request = createMockRequest(`${origin}/auth/callback?code=valid-auth-code`)

            await GET(request as any)

            const fetchCall = mockFetch.mock.calls[0]
            const body = JSON.parse(fetchCall[1].body)
            // When user has no metadata, full_name is undefined (omitted from JSON)
            expect(body.full_name).toBeUndefined()
        })

        it('should handle session without user object', async () => {
            mockExchangeCodeForSession.mockResolvedValue({
                data: {
                    session: { access_token: 'token' },
                    user: null,
                },
                error: null,
            })

            const request = createMockRequest(`${origin}/auth/callback?code=valid-auth-code`)

            // Should not throw
            await GET(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(
                expect.stringContaining('/dashboard')
            )
        })

        it('should handle special characters in error_description', async () => {
            const specialMessage = 'Error: access_denied (reason: "invalid scope")'
            const request = createMockRequest(`${origin}/auth/callback?error=access_denied&error_description=${encodeURIComponent(specialMessage)}`)

            await GET(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(
                expect.stringContaining('login?error=oauth_failed&message=')
            )
        })
    })
})
