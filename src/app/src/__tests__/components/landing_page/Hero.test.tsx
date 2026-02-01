import { render, screen } from '@testing-library/react'
import Hero from '@/app/components/landing_page/Hero'

// Mock SubtleTransitionLink
jest.mock('@/app/components/SubtleTransitionLink', () => {
    return function MockSubtleTransitionLink({
        children,
        href,
        className
    }: {
        children: React.ReactNode
        href: string
        className?: string
    }) {
        return (
            <a href={href} className={className} data-testid="transition-link">
                {children}
            </a>
        )
    }
})

// Mock CountUp component
jest.mock('@/app/components/landing_page/CountUp', () => {
    return function MockCountUp({
        end,
        prefix = '',
        suffix = ''
    }: {
        end: number
        prefix?: string
        suffix?: string
    }) {
        return <span data-testid="count-up">{prefix}{end}{suffix}</span>
    }
})

describe('Hero', () => {
    it('should render the headline', () => {
        render(<Hero />)

        expect(screen.getByText(/Fastest presentation creation/i)).toBeInTheDocument()
        expect(screen.getByText(/automation for enterprises/i)).toBeInTheDocument()
    })

    it('should render the description', () => {
        render(<Hero />)

        expect(screen.getByText(/FlashSlides is AI-powered presentation software/i)).toBeInTheDocument()
    })

    it('should render CTA buttons', () => {
        render(<Hero />)

        expect(screen.getByText('Get Started')).toBeInTheDocument()
        expect(screen.getByText('Book a Demo')).toBeInTheDocument()
    })

    it('should have correct links for CTA buttons', () => {
        render(<Hero />)

        const links = screen.getAllByTestId('transition-link')
        const hrefs = links.map(link => link.getAttribute('href'))

        expect(hrefs).toContain('/signup')
        expect(hrefs).toContain('/book-demo')
    })

    it('should render stat cards', () => {
        render(<Hero />)

        expect(screen.getByText('Generation Time')).toBeInTheDocument()
        expect(screen.getByText('Presentations Created')).toBeInTheDocument()
        expect(screen.getByText('Faster Creation')).toBeInTheDocument()
    })

    it('should render CountUp components with correct values', () => {
        render(<Hero />)

        const countUps = screen.getAllByTestId('count-up')
        expect(countUps.length).toBeGreaterThanOrEqual(3)

        // Check that stats are displayed
        expect(screen.getByText(/5 min/)).toBeInTheDocument()
        expect(screen.getByText(/10000\+/)).toBeInTheDocument()
        expect(screen.getByText(/200x/)).toBeInTheDocument()
    })
})
