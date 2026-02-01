import { createClient } from '@/utils/supabase/server'
import type { LoginParams, AuthResult } from './interface'

export const authAdapter = {
    async login({ email, password }: LoginParams): Promise<AuthResult> {
        const supabase = await createClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error || !data.session) {
            return {
                success: false,
                error: error?.message || 'Authentication failed'
            }
        }

        return {
            success: true,
            token: data.session.access_token,
            user: {
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name,
                first_name: data.user.user_metadata?.first_name,
                last_name: data.user.user_metadata?.last_name
            }
        }
    },

    async logout(): Promise<void> {
        const supabase = await createClient()
        await supabase.auth.signOut()
    }
}