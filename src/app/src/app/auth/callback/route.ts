import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
        const message = encodeURIComponent(errorDescription || 'Authentication failed')
        return NextResponse.redirect(`${origin}/login?error=oauth_failed&message=${message}`)
    }

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=no_code`)
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
        return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
    }

    if (data.session) {
        syncWithBackend(data.session.access_token, data.user)
    }

    return NextResponse.redirect(`${origin}/dashboard`)
}

async function syncWithBackend(accessToken: string, user: any) {
    const apiUrl = process.env.API_CONTAINER_URL
    if (!apiUrl) return

    const meta = user?.user_metadata || {}
    const fullName = meta.full_name || meta.name ||
        (meta.first_name && meta.last_name ? `${meta.first_name} ${meta.last_name}` : '')

    try {
        await fetch(`${apiUrl}/authenticate-jwt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                email: user?.email,
                full_name: fullName || undefined
            })
        })
    } catch {
        // Non-blocking sync - errors are logged but don't affect user flow
    }
}
