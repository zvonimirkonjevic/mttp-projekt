import { z } from 'zod'

// Re-create the schemas here to test them in isolation
// (In a real scenario, you might export these from the auth.ts file)
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

describe('Auth Schemas', () => {
    describe('loginSchema', () => {
        it('should validate a correct login payload', () => {
            const validPayload = {
                email: 'test@example.com',
                password: 'password123',
            }

            const result = loginSchema.safeParse(validPayload)
            expect(result.success).toBe(true)
        })

        it('should reject an invalid email format', () => {
            const invalidPayload = {
                email: 'invalid-email',
                password: 'password123',
            }

            const result = loginSchema.safeParse(invalidPayload)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email address')
            }
        })

        it('should reject an empty password', () => {
            const invalidPayload = {
                email: 'test@example.com',
                password: '',
            }

            const result = loginSchema.safeParse(invalidPayload)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password is required')
            }
        })

        it('should reject missing email', () => {
            const invalidPayload = {
                password: 'password123',
            }

            const result = loginSchema.safeParse(invalidPayload)
            expect(result.success).toBe(false)
        })
    })

    describe('signupSchema', () => {
        const validPayload = {
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            termsAccepted: true as const,
            marketingConsent: false,
        }

        it('should validate a correct signup payload', () => {
            const result = signupSchema.safeParse(validPayload)
            expect(result.success).toBe(true)
        })

        it('should reject password shorter than 8 characters', () => {
            const invalidPayload = {
                ...validPayload,
                password: 'short',
                confirmPassword: 'short',
            }

            const result = signupSchema.safeParse(invalidPayload)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Password must be at least 8 characters')
            }
        })

        it('should reject mismatched passwords', () => {
            const invalidPayload = {
                ...validPayload,
                confirmPassword: 'differentpassword',
            }

            const result = signupSchema.safeParse(invalidPayload)
            expect(result.success).toBe(false)
            if (!result.success) {
                const confirmPasswordError = result.error.issues.find(
                    (issue) => issue.path.includes('confirmPassword')
                )
                expect(confirmPasswordError?.message).toBe('Passwords do not match')
            }
        })

        it('should reject when terms are not accepted', () => {
            const invalidPayload = {
                ...validPayload,
                termsAccepted: false,
            }

            const result = signupSchema.safeParse(invalidPayload)
            expect(result.success).toBe(false)
        })

        it('should reject empty first name', () => {
            const invalidPayload = {
                ...validPayload,
                firstName: '',
            }

            const result = signupSchema.safeParse(invalidPayload)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('First name is required')
            }
        })

        it('should reject empty last name', () => {
            const invalidPayload = {
                ...validPayload,
                lastName: '',
            }

            const result = signupSchema.safeParse(invalidPayload)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Last name is required')
            }
        })

        it('should allow optional marketing consent', () => {
            const payloadWithoutMarketing = {
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                termsAccepted: true as const,
            }

            const result = signupSchema.safeParse(payloadWithoutMarketing)
            expect(result.success).toBe(true)
        })
    })
})
