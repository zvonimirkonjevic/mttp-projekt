// Mock session data
export const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
        id: 'mock-user-id',
        email: 'zvonimir.konjevic@gmail.com',
        user_metadata: {
            first_name: 'Zvonimir',
            last_name: 'Konjevic',
        },
    },
}

// Mock user profile data
export const mockUserProfile = {
    id: 'mock-user-id',
    first_name: 'Zvonimir',
    last_name: 'Konjevic',
    credits_balance: 100,
    stripe_customer_id: 'cus_mock123',
    profile_image_url: null,
    preferences: {
        company: 'Test Company',
    },
}

// Create mock Supabase client
export const createMockSupabaseClient = () => ({
    auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
        getUser: jest.fn().mockResolvedValue({ data: { user: mockSession.user }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({
            data: { session: mockSession, user: mockSession.user },
            error: null
        }),
        signUp: jest.fn().mockResolvedValue({ data: { user: mockSession.user }, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: jest.fn().mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } },
        }),
    },
    from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockUserProfile, error: null }),
            }),
        }),
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
    }),
    storage: {
        from: jest.fn().mockReturnValue({
            upload: jest.fn().mockResolvedValue({ data: { path: 'test-avatar.jpg' }, error: null }),
            getPublicUrl: jest.fn().mockReturnValue({
                data: { publicUrl: 'https://storage.example.com/avatars/test-avatar.jpg' }
            }),
        }),
    },
    channel: jest.fn().mockReturnValue({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
    }),
    removeChannel: jest.fn(),
})

// Mock for @/utils/supabase/client
export const mockBrowserClient = createMockSupabaseClient()

// Mock for @/utils/supabase/server
export const mockServerClient = createMockSupabaseClient()
