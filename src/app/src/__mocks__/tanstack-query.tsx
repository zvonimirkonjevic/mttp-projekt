import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a new QueryClient for each test to avoid state leaking
export function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    })
}

// Wrapper component for testing hooks that use React Query
export function createWrapper() {
    const testQueryClient = createTestQueryClient()
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={testQueryClient}>
                {children}
            </QueryClientProvider>
        )
    }
}

// For components that need QueryClientProvider
export function QueryWrapper({ children }: { children: React.ReactNode }) {
    const queryClient = React.useMemo(() => createTestQueryClient(), [])
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
