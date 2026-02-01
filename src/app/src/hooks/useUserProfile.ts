import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { UserProfile } from '@/app/contexts/UserContext'
import axios from 'axios'

export function useUserProfile() {
    const queryClient = useQueryClient()
    const supabase = createClient()
    const KEY = ['user-profile']

    // Fetch logic mirroring UserContext but via React Query
    const { data: profile, isLoading, error } = useQuery({
        queryKey: KEY,
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return null

            // 1. Try Supabase
            const { data, error } = await supabase
                .from('users')
                .select('first_name, last_name, credits_balance, stripe_customer_id, profile_image_url, preferences')
                .eq('id', session.user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                throw error
            }

            if (data) {
                // Map database fields to frontend interface
                return {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    credits_balance: data.credits_balance,
                    stripe_customer_id: data.stripe_customer_id,
                    avatar_url: data.profile_image_url || null,
                    company: data.preferences?.company || null
                } as UserProfile
            }

            // Fallback/Self-healing could be added here if needed,
            // but for now we rely on the main UserContext to handle initial healing
            // or duplicate it. Since this is for settings, likely the user exists.
            return null
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Mutation logic
    const updateProfileMutation = useMutation({
        mutationFn: async (newData: Partial<UserProfile> & { company?: string, avatar_url?: string }) => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.access_token) throw new Error("No session")

            const apiUrl = "http://localhost:3001"
            if (!apiUrl) throw new Error("Missing API URL")

            // Use the token for authentication
            const res = await axios.patch(`${apiUrl}/update_profile`, newData, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            })
            return res.data
        },
        onMutate: async (newData) => {
            // 1. Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: KEY })

            // 2. Snapshot previous value
            const previousProfile = queryClient.getQueryData<UserProfile>(KEY)

            // 3. Optimistically update
            if (previousProfile) {
                queryClient.setQueryData(KEY, {
                    ...previousProfile,
                    ...newData,
                })
            }

            return { previousProfile }
        },
        onError: (err, newData, context) => {
            // 4. Rollback
            if (context?.previousProfile) {
                queryClient.setQueryData(KEY, context.previousProfile)
            }
        },
        onSuccess: () => {
            // 5. Invalidate to refetch fresh data
            queryClient.invalidateQueries({ queryKey: KEY })
        },
    })

    return {
        profile,
        isLoading,
        error,
        updateProfile: updateProfileMutation.mutateAsync,
        isUpdating: updateProfileMutation.isPending
    }
}
