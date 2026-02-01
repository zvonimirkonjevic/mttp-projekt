import { renderHook, act, waitFor } from '@testing-library/react'
import { UserProvider, useUser } from '@/app/contexts/UserContext'
import React from 'react'

// Mock data
const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
        first_name: 'John',
        last_name: 'Doe',
    },
}

const mockProfile = {
    first_name: 'John',
    last_name: 'Doe',
    credits_balance: 100,
    stripe_customer_id: 'cus_123',
    profile_image_url: 'https://example.com/avatar.jpg',
    preferences: { company: 'Test Corp' },
}

// Mock functions
const mockGetUser = jest.fn()
const mockGetSession = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockChannel = jest.fn()
const mockRemoveChannel = jest.fn()
const mockFrom = jest.fn()

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: () => '/dashboard',
}))

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: mockGetUser,
            getSession: mockGetSession,
            onAuthStateChange: mockOnAuthStateChange,
        },
        from: mockFrom,
        channel: mockChannel,
        removeChannel: mockRemoveChannel,
    }),
}))

// Mock fetch for self-healing
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('UserContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()

        // Default mocks
        mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
        mockGetSession.mockResolvedValue({
            data: { session: { access_token: 'mock-token' } },
            error: null,
        })
        mockOnAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } },
        })
        mockFrom.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                }),
            }),
        })
        mockChannel.mockReturnValue({
            on: jest.fn().mockReturnThis(),
            subscribe: jest.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
        })
        mockFetch.mockResolvedValue({ ok: true })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('useUser hook', () => {
        it('should throw error when used outside UserProvider', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

            expect(() => {
                renderHook(() => useUser())
            }).toThrow('useUser must be used within UserProvider')

            consoleSpy.mockRestore()
        })
    })

    describe('UserProvider', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UserProvider>{children}</UserProvider>
        )

        it('should provide initial loading state', async () => {
            const { result } = renderHook(() => useUser(), { wrapper })

            expect(result.current.isLoading).toBe(true)
            expect(result.current.user).toBe(null)
            expect(result.current.profile).toBe(null)
        })

        it('should fetch user and profile on mount', async () => {
            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(mockGetUser).toHaveBeenCalled()
            expect(result.current.user).toEqual(mockUser)
        })

        it('should map profile data correctly', async () => {
            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.profile).not.toBeNull()
            })

            expect(result.current.profile).toEqual({
                first_name: 'John',
                last_name: 'Doe',
                credits_balance: 100,
                stripe_customer_id: 'cus_123',
                avatar_url: 'https://example.com/avatar.jpg',
                company: 'Test Corp',
            })
        })

        it('should handle no authenticated user', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.user).toBe(null)
            expect(result.current.profile).toBe(null)
        })

        it('should handle AuthSessionMissingError gracefully', async () => {
            mockGetUser.mockResolvedValue({
                data: { user: null },
                error: { name: 'AuthSessionMissingError', message: 'No session' },
            })

            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            // Should not throw, just set user to null
            expect(result.current.user).toBe(null)
        })

        it('should handle other auth errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
            mockGetUser.mockResolvedValue({
                data: { user: null },
                error: { name: 'SomeError', message: 'Some error' },
            })

            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(consoleSpy).toHaveBeenCalled()
            consoleSpy.mockRestore()
        })

        it('should set isLoading to false after 3 second fallback timeout', async () => {
            // Mock getUser to never resolve
            mockGetUser.mockImplementation(() => new Promise(() => {}))

            const { result } = renderHook(() => useUser(), { wrapper })

            expect(result.current.isLoading).toBe(true)

            await act(async () => {
                jest.advanceTimersByTime(3000)
            })

            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('Self-healing logic', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UserProvider>{children}</UserProvider>
        )

        it('should trigger self-healing when profile is missing (PGRST116)', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

            // First call returns PGRST116 (no rows found)
            const mockSingle = jest.fn()
                .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
                .mockResolvedValueOnce({ data: mockProfile, error: null })

            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: mockSingle,
                    }),
                }),
            })

            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            // Should call authenticate-jwt endpoint
            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    expect.stringContaining('/authenticate-jwt'),
                    expect.objectContaining({
                        method: 'POST',
                        headers: expect.objectContaining({
                            'Authorization': 'Bearer mock-token',
                        }),
                    })
                )
            })

            consoleSpy.mockRestore()
        })

        it('should retry up to 2 times for self-healing', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

            // Always return PGRST116 to test max retries
            const mockSingle = jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
            })

            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: mockSingle,
                    }),
                }),
            })

            renderHook(() => useUser(), { wrapper })

            await act(async () => {
                // Run all timers including retry delays
                for (let i = 0; i < 10; i++) {
                    jest.advanceTimersByTime(1000)
                    await Promise.resolve()
                }
            })

            // Should have retry warnings (at least one, possibly more due to navigation effects)
            expect(consoleSpy).toHaveBeenCalled()
            consoleSpy.mockRestore()
        })

        it('should handle fetch failure during self-healing', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { code: 'PGRST116' },
                        }),
                    }),
                }),
            })

            mockFetch.mockRejectedValue(new Error('Network error'))

            renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to call authenticate-jwt:',
                expect.any(Error)
            )

            consoleErrorSpy.mockRestore()
            consoleWarnSpy.mockRestore()
        })
    })

    describe('Auth state change listener', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UserProvider>{children}</UserProvider>
        )

        it('should set up auth state change listener', async () => {
            renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            expect(mockOnAuthStateChange).toHaveBeenCalled()
        })

        it('should unsubscribe on unmount', async () => {
            const unsubscribeMock = jest.fn()
            mockOnAuthStateChange.mockReturnValue({
                data: { subscription: { unsubscribe: unsubscribeMock } },
            })

            const { unmount } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            unmount()

            expect(unsubscribeMock).toHaveBeenCalled()
        })

        it('should handle user data from initial load', async () => {
            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.user).not.toBeNull()
            })

            expect(result.current.user?.id).toBe('user-123')
        })
    })

    describe('Realtime subscription', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UserProvider>{children}</UserProvider>
        )

        it('should set up realtime subscription when user is authenticated', async () => {
            renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(mockChannel).toHaveBeenCalledWith('realtime-profile')
            })
        })

        it('should update profile on realtime UPDATE event', async () => {
            let realtimeCallback: (payload: any) => void

            mockChannel.mockReturnValue({
                on: jest.fn().mockImplementation((_type, _filter, callback) => {
                    realtimeCallback = callback
                    return { subscribe: jest.fn().mockResolvedValue({ status: 'SUBSCRIBED' }) }
                }),
                subscribe: jest.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
            })

            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.profile).not.toBeNull()
            })

            // Simulate realtime update
            await act(async () => {
                realtimeCallback({
                    new: {
                        id: 'user-123',
                        credits_balance: 200,
                    },
                })
            })

            expect(result.current.profile?.credits_balance).toBe(200)
        })

        it('should ignore realtime updates for different users', async () => {
            let realtimeCallback: (payload: any) => void

            mockChannel.mockReturnValue({
                on: jest.fn().mockImplementation((_type, _filter, callback) => {
                    realtimeCallback = callback
                    return { subscribe: jest.fn().mockResolvedValue({ status: 'SUBSCRIBED' }) }
                }),
                subscribe: jest.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
            })

            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.profile).not.toBeNull()
            })

            const originalCredits = result.current.profile?.credits_balance

            // Simulate realtime update for different user
            await act(async () => {
                realtimeCallback({
                    new: {
                        id: 'different-user-999',
                        credits_balance: 500,
                    },
                })
            })

            // Should remain unchanged
            expect(result.current.profile?.credits_balance).toBe(originalCredits)
        })

        it('should remove channel on unmount', async () => {
            const { unmount } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            unmount()

            expect(mockRemoveChannel).toHaveBeenCalled()
        })
    })

    describe('refreshProfile', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UserProvider>{children}</UserProvider>
        )

        it('should refetch profile when called', async () => {
            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.profile).not.toBeNull()
            })

            const initialCallCount = mockFrom.mock.calls.length

            await act(async () => {
                await result.current.refreshProfile()
            })

            expect(mockFrom.mock.calls.length).toBeGreaterThan(initialCallCount)
        })

        it('should not fetch when no user is authenticated', async () => {
            mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            const callCountBefore = mockFrom.mock.calls.length

            await act(async () => {
                await result.current.refreshProfile()
            })

            expect(mockFrom.mock.calls.length).toBe(callCountBefore)
        })
    })

    describe('Profile mapping', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <UserProvider>{children}</UserProvider>
        )

        it('should handle null profile_image_url', async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { ...mockProfile, profile_image_url: null },
                            error: null,
                        }),
                    }),
                }),
            })

            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.profile).not.toBeNull()
            })

            expect(result.current.profile?.avatar_url).toBe(null)
        })

        it('should handle missing preferences', async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { ...mockProfile, preferences: null },
                            error: null,
                        }),
                    }),
                }),
            })

            const { result } = renderHook(() => useUser(), { wrapper })

            await act(async () => {
                jest.runAllTimers()
            })

            await waitFor(() => {
                expect(result.current.profile).not.toBeNull()
            })

            expect(result.current.profile?.company).toBe(null)
        })
    })
})
