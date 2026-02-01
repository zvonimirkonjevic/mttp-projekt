/**
 * Custom render function for testing React components
 */
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserProvider, UserProfile } from '@/app/contexts/UserContext'
import { User } from '@supabase/supabase-js'

// Create a fresh QueryClient for each test
function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    })
}

interface WrapperProps {
    children: React.ReactNode
}

// All-in-one provider wrapper (without UserProvider for basic tests)
function AllProviders({ children }: WrapperProps) {
    const queryClient = React.useMemo(() => createTestQueryClient(), [])

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

// Custom render that wraps components with providers
function customRender(
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, { wrapper: AllProviders, ...options })
}

/**
 * Extended render options for components that need UserProvider
 */
interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    withUserProvider?: boolean
}

/**
 * Provider wrapper that includes UserProvider for testing authenticated components
 * Note: You need to mock @/utils/supabase/client before using this
 */
function AllProvidersWithUser({ children }: WrapperProps) {
    const queryClient = React.useMemo(() => createTestQueryClient(), [])

    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                {children}
            </UserProvider>
        </QueryClientProvider>
    )
}

/**
 * Render with optional UserProvider support
 * @param ui - React element to render
 * @param options - Render options, set withUserProvider: true to include UserProvider
 */
function renderWithOptions(
    ui: React.ReactElement,
    { withUserProvider = false, ...options }: ExtendedRenderOptions = {}
) {
    const Wrapper = withUserProvider ? AllProvidersWithUser : AllProviders
    return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Mock user data for testing
 */
export const mockUser: Partial<User> = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
        first_name: 'Test',
        last_name: 'User',
    },
}

export const mockUserProfile: UserProfile = {
    first_name: 'Test',
    last_name: 'User',
    credits_balance: 100,
    stripe_customer_id: 'cus_test123',
    avatar_url: null,
    company: 'Test Company',
}

/**
 * Creates a mock UserContext value for testing
 */
export function createMockUserContext(overrides?: Partial<{
    user: User | null
    profile: UserProfile | null
    isLoading: boolean
    refreshProfile: () => Promise<void>
}>) {
    return {
        user: mockUser as User,
        profile: mockUserProfile,
        isLoading: false,
        refreshProfile: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render, renderWithOptions, createTestQueryClient }
