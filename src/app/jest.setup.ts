import '@testing-library/jest-dom'
import React from 'react'

// Mock IntersectionObserver
class MockIntersectionObserver {
    readonly root: Element | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []

    constructor(callback: IntersectionObserverCallback) {
        // Immediately call callback with mock entries showing element is visible
        setTimeout(() => {
            callback(
                [{ isIntersecting: true, intersectionRatio: 1 }] as IntersectionObserverEntry[],
                this
            )
        }, 0)
    }

    observe(): void { }
    unobserve(): void { }
    disconnect(): void { }
    takeRecords(): IntersectionObserverEntry[] { return [] }
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    redirect: jest.fn(),
}))

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
    const createMotionComponent = (tag: string) => {
        const Component = React.forwardRef<HTMLElement, React.PropsWithChildren<Record<string, unknown>>>(
            ({ children, initial, animate, exit, transition, whileHover, whileTap, variants, ...props }, ref) => {
                return React.createElement(tag, { ...props, ref }, children)
            }
        )
        Component.displayName = `motion.${tag}`
        return Component
    }

    return {
        motion: {
            div: createMotionComponent('div'),
            h1: createMotionComponent('h1'),
            p: createMotionComponent('p'),
            button: createMotionComponent('button'),
            span: createMotionComponent('span'),
            section: createMotionComponent('section'),
            nav: createMotionComponent('nav'),
            a: createMotionComponent('a'),
            ul: createMotionComponent('ul'),
            li: createMotionComponent('li'),
        },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
        useAnimation: () => ({
            start: jest.fn(),
            set: jest.fn(),
        }),
    }
})

// Mock next/dynamic
jest.mock('next/dynamic', () => {
    return function dynamic(importFn: () => Promise<{ default: React.ComponentType }>) {
        const Component = React.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
            return React.createElement('div', { ...props, ref, 'data-testid': 'dynamic-component' })
        })
        Component.displayName = 'DynamicComponent'
        return Component
    }
})

// Suppress console errors/warnings during tests (optional - remove if you want to see them)
const originalError = console.error
beforeAll(() => {
    console.error = (...args: unknown[]) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is no longer supported')
        ) {
            return
        }
        originalError.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
})
