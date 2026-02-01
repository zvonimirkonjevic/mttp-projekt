import { renderHook, waitFor } from '@testing-library/react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { createWrapper } from '@/__mocks__/tanstack-query'

// Mock Supabase client
const mockGetSession = jest.fn()
const mockSelect = jest.fn()

jest.mock('@/utils/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getSession: mockGetSession,
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: mockSelect,
                }),
            }),
        }),
    }),
}))

// Mock axios
jest.mock('axios', () => ({
    patch: jest.fn().mockResolvedValue({ data: { success: true } }),
}))

describe('useUserProfile', () => {
    const mockSession = {
        access_token: 'mock-token',
        user: { id: 'user-123' },
    }

    const mockProfile = {
        first_name: 'John',
        last_name: 'Doe',
        credits_balance: 100,
        stripe_customer_id: 'cus_123',
        profile_image_url: 'https://example.com/avatar.jpg',
        preferences: { company: 'Test Corp' },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetSession.mockResolvedValue({
            data: { session: mockSession },
            error: null,
        })
        mockSelect.mockResolvedValue({
            data: mockProfile,
            error: null,
        })
    })

    it('should fetch user profile on mount', async () => {
        const { result } = renderHook(() => useUserProfile(), {
            wrapper: createWrapper(),
        })

        // Initially loading
        expect(result.current.isLoading).toBe(true)

        // Wait for data to load
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        // Check profile data is mapped correctly
        expect(result.current.profile).toEqual({
            first_name: 'John',
            last_name: 'Doe',
            credits_balance: 100,
            stripe_customer_id: 'cus_123',
            avatar_url: 'https://example.com/avatar.jpg',
            company: 'Test Corp',
        })
    })

    it('should return null profile when no session exists', async () => {
        mockGetSession.mockResolvedValue({
            data: { session: null },
            error: null,
        })

        const { result } = renderHook(() => useUserProfile(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.profile).toBeNull()
    })

    it('should handle fetch errors', async () => {
        mockSelect.mockResolvedValue({
            data: null,
            error: { code: 'SOME_ERROR', message: 'Database error' },
        })

        const { result } = renderHook(() => useUserProfile(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.error).toBeTruthy()
    })

    it('should have updateProfile function', async () => {
        const { result } = renderHook(() => useUserProfile(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(typeof result.current.updateProfile).toBe('function')
    })

    it('should indicate when updating', async () => {
        const { result } = renderHook(() => useUserProfile(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        // Initially not updating
        expect(result.current.isUpdating).toBe(false)
    })
})
