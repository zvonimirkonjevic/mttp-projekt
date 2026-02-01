'use client'

import { useEffect, useState, createContext, useContext, useCallback, ReactNode, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
    first_name: string | null
    last_name: string | null
    credits_balance: number
    stripe_customer_id: string | null
    avatar_url?: string | null
    company?: string | null
}

interface UserContextType {
    user: User | null
    profile: UserProfile | null
    isLoading: boolean
    refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const pathname = usePathname()
    const previousUserIdRef = useRef<string | null>(null)

    // --- THE SELF-HEALING FETCH LOGIC ---
    const fetchProfile = useCallback(async (currentUserId: string, retryCount = 0) => {
        // Create client inside callback to avoid stale references
        const supabase = createClient()

        // 1. Try to read from Supabase (Fastest path)
        const { data, error } = await supabase
            .from('users')
            .select('first_name, last_name, credits_balance, stripe_customer_id, profile_image_url, preferences')
            .eq('id', currentUserId)
            .single()

        if (data) {
            // Map database fields to frontend interface
            const mappedProfile: UserProfile = {
                first_name: data.first_name,
                last_name: data.last_name,
                credits_balance: data.credits_balance,
                stripe_customer_id: data.stripe_customer_id,
                avatar_url: data.profile_image_url || null,
                company: data.preferences?.company || null
            }
            setProfile(mappedProfile)
            return
        }

        // 2. DETECT MISSING USER (Ghost User)
        // Error code PGRST116 means "No rows found"
        if (error?.code === 'PGRST116') {
            console.warn(`Profile missing (Attempt ${retryCount + 1}). Triggering Self-Healing...`)

            // Stop infinite loops
            if (retryCount >= 2) return

            try {
                // 3. CALL FASTAPI HANDSHAKE MANUALLY
                // This forces the backend to run the "Create User" logic immediately.
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.access_token) {
                    // Use localhost for client-side requests since browser can't resolve Docker hostnames
                    const apiUrl = typeof window !== 'undefined'
                        ? 'http://localhost:3001'
                        : (process.env.NEXT_PUBLIC_API_CONTAINER_URL || process.env.API_CONTAINER_URL)

                    if (!apiUrl) {
                        console.error('Missing API URL: set NEXT_PUBLIC_API_CONTAINER_URL in your environment')
                        return
                    }

                    const controller = new AbortController()
                    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

                    try {
                        await fetch(`${apiUrl}/authenticate-jwt`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${session.access_token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({}),
                            signal: controller.signal
                        })
                    } catch (fetchError) {
                        console.error("Failed to call authenticate-jwt:", fetchError)
                        // Don't throw - allow the function to continue
                    } finally {
                        clearTimeout(timeoutId)
                    }

                    // 4. RETRY FETCH
                    // Wait 500ms for DB to sync, then try again
                    setTimeout(() => fetchProfile(currentUserId, retryCount + 1), 500)
                }
            } catch (err) {
                console.error("Self-healing failed:", err)
                // Self-healing failed, but don't crash the app
                // User can still try to refresh or re-login
            }
        }
    }, [])

    useEffect(() => {
        const supabase = createClient()
        let currentUserId: string | null = null

        const initData = async () => {
            try {
                const { data: { user: authUser }, error } = await supabase.auth.getUser()

                // AuthSessionMissingError is expected when no user is logged in
                if (error && error.name !== 'AuthSessionMissingError') {
                    throw error
                }

                if (authUser) {
                    currentUserId = authUser.id
                    setUser(authUser)
                    setProfile(null)
                    fetchProfile(authUser.id).catch(console.error)
                } else {
                    setUser(null)
                    setProfile(null)
                }
            } catch (error) {
                console.error("Error initializing user data:", error)
                setUser(null)
                setProfile(null)
            } finally {
                setIsLoading(false)
            }
        }

        initData()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_OUT' || !session?.user) {
                    currentUserId = null
                    setUser(null)
                    setProfile(null)
                    setIsLoading(false)
                    return
                }

                const newUserId = session.user.id

                // Handle all session events that indicate a (potentially new) user session
                // SIGNED_IN: Explicit sign-in action
                // INITIAL_SESSION: Session loaded from storage on mount (covers server-side login)
                // TOKEN_REFRESHED: Token refresh can happen with different user after server login
                if (
                    event === 'SIGNED_IN' ||
                    event === 'INITIAL_SESSION' ||
                    event === 'TOKEN_REFRESHED'
                ) {
                    // Only refetch if user actually changed
                    if (newUserId !== currentUserId) {
                        currentUserId = newUserId
                        setUser(session.user)
                        setProfile(null)
                        fetchProfile(newUserId).catch(console.error)
                    }
                } else if (event === 'USER_UPDATED' && session?.user) {
                    // Handle profile metadata updates
                    setUser(session.user)
                }

                setIsLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [fetchProfile])

    // Check for user changes on navigation (handles server-side login redirect)
    useEffect(() => {
        const checkForUserChange = async () => {
            const supabase = createClient()
            const { data: { user: authUser } } = await supabase.auth.getUser()

            const currentAuthUserId = authUser?.id || null
            const currentStateUserId = user?.id || null

            // If authenticated user differs from React state, refresh
            if (currentAuthUserId !== currentStateUserId) {
                if (authUser) {
                    previousUserIdRef.current = authUser.id
                    setUser(authUser)
                    setProfile(null)
                    setIsLoading(true)
                    fetchProfile(authUser.id).catch(console.error).finally(() => setIsLoading(false))
                } else {
                    previousUserIdRef.current = null
                    setUser(null)
                    setProfile(null)
                    setIsLoading(false)
                }
            }
        }

        // Only run on dashboard routes to avoid unnecessary API calls
        if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/settings')) {
            checkForUserChange()
        }
    }, [pathname, user?.id, fetchProfile])

    // Safety fallback: Force loading to false after 3 seconds if nothing else does
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 3000)
        return () => clearTimeout(timer)
    }, [])

    // Set up realtime subscription separately
    useEffect(() => {
        if (!user) return

        const supabase = createClient()

        // Realtime Listener for Credits
        const channel = supabase
            .channel('realtime-profile')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'users' },
                (payload) => {
                    if (payload.new.id === user?.id) {
                        setProfile(prev => ({ ...prev, ...payload.new } as UserProfile))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id)
        }
    }, [user, fetchProfile])

    return (
        <UserContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within UserProvider')
    }
    return context
}