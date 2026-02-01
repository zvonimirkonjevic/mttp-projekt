'use server'

import { authAdapter } from '@/lib/auth/supabase-adapter'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    termsAccepted: z.literal(true, {
        message: 'You must accept the Terms of Service',
    }),
    marketingConsent: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

export interface LoginState {
    error?: string;
    success?: boolean;
}

export interface SignupState {
    error?: string;
    success?: boolean;
    message?: string;
}

export async function loginAction(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {

    const validation = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validation.success) {
        return { error: 'Invalid email or password format.' }
    }

    const { email, password } = validation.data

    const authResult = await authAdapter.login({ email, password })

    if (!authResult.success || !authResult.token) {
        return { error: authResult.error || 'Authentication failed' }
    }

    try {
        const apiUrl = process.env.API_CONTAINER_URL

        if (apiUrl) {
            const backendResponse = await fetch(`${apiUrl}/authenticate-jwt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResult.token}`
                },
                body: JSON.stringify({
                    email: authResult.user?.email,
                    full_name: authResult.user?.full_name ||
                        (authResult.user?.first_name && authResult.user?.last_name
                            ? `${authResult.user.first_name} ${authResult.user.last_name}`
                            : undefined)
                })
            })

            if (!backendResponse.ok) {
                console.error(`FastAPI Sync Failed: ${backendResponse.status}`)

                const errorBody = await backendResponse.text();
                console.error(`FastAPI Error (${backendResponse.status}):`, errorBody);

                await authAdapter.logout()

                if (backendResponse.status === 403) {
                    return { error: 'Your account has been suspended.' }
                }

                return { error: 'Service temporarily unavailable. Please try again.' }
            }
        }
    } catch (error) {
        console.error('Network Error connecting to FastAPI:', error)
        await authAdapter.logout()
        return { error: 'System error. Please contact support.' }
    }

    redirect('/dashboard')
}

export async function signupAction(
    prevState: SignupState,
    formData: FormData
): Promise<SignupState> {

    const validation = signupSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        termsAccepted: formData.get('termsAccepted') === 'on',
        marketingConsent: formData.get('marketingConsent') === 'on',
    })

    if (!validation.success) {
        const firstError = validation.error.issues[0]
        return { error: firstError?.message || 'Invalid input' }
    }

    const { email, password, firstName, lastName, marketingConsent } = validation.data
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                marketing_consent: marketingConsent,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    return {
        success: true,
        message: 'Success! Please check your email to confirm your account.'
    }
}

export async function logoutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut({ scope: 'global' })
    redirect('/')
}