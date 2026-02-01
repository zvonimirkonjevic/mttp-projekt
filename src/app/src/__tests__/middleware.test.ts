/**
 * Tests for Next.js middleware
 * Tests route protection and authentication redirects
 */

// Track redirects
const mockRedirect = jest.fn()
const mockNext = jest.fn()

// Mock NextResponse before importing
jest.mock('next/server', () => ({
    NextResponse: {
        redirect: (url: URL) => {
            mockRedirect(url.toString())
            return {
                url: url.toString(),
                cookies: {
                    set: jest.fn(),
                },
            }
        },
        next: ({ request }: { request: any }) => {
            mockNext()
            return {
                request,
                cookies: {
                    set: jest.fn(),
                },
            }
        },
    },
}))

// Mock Supabase SSR client
const mockGetUser = jest.fn()
jest.mock('@supabase/ssr', () => ({
    createServerClient: jest.fn().mockImplementation(() => ({
        auth: {
            getUser: mockGetUser,
        },
    })),
}))

// Helper to create mock NextRequest-like objects with clone support
function createMockRequest(urlString: string) {
    const url = new URL(urlString)
    // Add clone method that URL doesn't have natively
    const cloneableUrl = Object.assign(url, {
        clone: () => new URL(url.toString()),
    })
    return {
        url: url.toString(),
        nextUrl: cloneableUrl,
        cookies: {
            getAll: () => [],
            set: jest.fn(),
        },
    }
}

// Import after mocking
import { middleware, config } from '@/middleware'

describe('Middleware', () => {
    const origin = 'http://localhost:3000'

    beforeEach(() => {
        jest.clearAllMocks()
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    })

    describe('Route protection', () => {
        it('should redirect unauthenticated users from /dashboard to /login', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/dashboard`)

            await middleware(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/login'))
        })

        it('should redirect unauthenticated users from /dashboard/settings to /login', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/dashboard/settings`)

            await middleware(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/login'))
        })

        it('should redirect unauthenticated users from nested dashboard routes', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/dashboard/presentations/123`)

            await middleware(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/login'))
        })

        it('should allow authenticated users to access /dashboard', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'user-123' } },
                error: null,
            })

            const request = createMockRequest(`${origin}/dashboard`)

            await middleware(request as any)

            expect(mockRedirect).not.toHaveBeenCalled()
            expect(mockNext).toHaveBeenCalled()
        })

        it('should allow authenticated users to access nested dashboard routes', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'user-123' } },
                error: null,
            })

            const request = createMockRequest(`${origin}/dashboard/settings/profile`)

            await middleware(request as any)

            expect(mockRedirect).not.toHaveBeenCalled()
            expect(mockNext).toHaveBeenCalled()
        })
    })

    describe('Auth page redirects', () => {
        it('should redirect authenticated users from /login to /dashboard', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'user-123' } },
                error: null,
            })

            const request = createMockRequest(`${origin}/login`)

            await middleware(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'))
        })

        it('should redirect authenticated users from /signup to /dashboard', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'user-123' } },
                error: null,
            })

            const request = createMockRequest(`${origin}/signup`)

            await middleware(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'))
        })

        it('should allow unauthenticated users to access /login', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/login`)

            await middleware(request as any)

            expect(mockRedirect).not.toHaveBeenCalled()
            expect(mockNext).toHaveBeenCalled()
        })

        it('should allow unauthenticated users to access /signup', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/signup`)

            await middleware(request as any)

            expect(mockRedirect).not.toHaveBeenCalled()
            expect(mockNext).toHaveBeenCalled()
        })
    })

    describe('Public routes', () => {
        it('should allow unauthenticated users to access public pages', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/`)

            await middleware(request as any)

            expect(mockRedirect).not.toHaveBeenCalled()
            expect(mockNext).toHaveBeenCalled()
        })

        it('should allow access to /pricing without authentication', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/pricing`)

            await middleware(request as any)

            expect(mockRedirect).not.toHaveBeenCalled()
            expect(mockNext).toHaveBeenCalled()
        })

        it('should allow access to /terms without authentication', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/terms`)

            await middleware(request as any)

            expect(mockRedirect).not.toHaveBeenCalled()
            expect(mockNext).toHaveBeenCalled()
        })

        it('should allow access to /auth/callback without authentication', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/auth/callback?code=abc`)

            await middleware(request as any)

            expect(mockRedirect).not.toHaveBeenCalled()
            expect(mockNext).toHaveBeenCalled()
        })
    })

    describe('Session refresh', () => {
        it('should call getUser to refresh session', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/some-page`)

            await middleware(request as any)

            expect(mockGetUser).toHaveBeenCalled()
        })

        it('should handle getUser errors gracefully', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: null },
                error: { message: 'Session expired' },
            })

            const request = createMockRequest(`${origin}/dashboard`)

            await middleware(request as any)

            // Should redirect to login when session error occurs
            expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/login'))
        })
    })

    describe('Config matcher', () => {
        it('should have correct matcher configuration', () => {
            expect(config.matcher).toBeDefined()
            expect(config.matcher).toEqual([
                '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
            ])
        })
    })

    describe('Edge cases', () => {
        it('should handle /login with query params', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: { id: 'user-123' } },
                error: null,
            })

            const request = createMockRequest(`${origin}/login?redirect=/dashboard/settings`)

            await middleware(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/dashboard'))
        })

        it('should handle trailing slashes on routes', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const request = createMockRequest(`${origin}/dashboard/`)

            await middleware(request as any)

            expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/login'))
        })
    })
})
