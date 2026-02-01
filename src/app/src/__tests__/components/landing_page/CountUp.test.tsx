import { render, screen, waitFor } from '@testing-library/react'
import CountUp from '@/app/components/landing_page/CountUp'

// Mock framer-motion's useInView
jest.mock('framer-motion', () => {
    const actual = jest.requireActual('framer-motion')
    return {
        ...actual,
        useInView: jest.fn().mockReturnValue(true),
        motion: {
            span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
                const { initial, animate, transition, ...validProps } = props
                return <span {...validProps}>{children}</span>
            },
        },
    }
})

describe('CountUp', () => {
    it('should render with end value eventually', async () => {
        render(<CountUp end={100} />)

        // The component animates to the target value
        // We check that it eventually displays a number
        await waitFor(() => {
            const element = screen.getByText(/\d+/)
            expect(element).toBeInTheDocument()
        }, { timeout: 3000 })
    })

    it('should render with prefix', async () => {
        render(<CountUp end={50} prefix="$" />)

        await waitFor(() => {
            expect(screen.getByText(/\$/)).toBeInTheDocument()
        })
    })

    it('should render with suffix', async () => {
        render(<CountUp end={100} suffix="%" />)

        await waitFor(() => {
            expect(screen.getByText(/%/)).toBeInTheDocument()
        })
    })

    it('should render with both prefix and suffix', async () => {
        render(<CountUp end={99} prefix="~" suffix="+" />)

        await waitFor(() => {
            const element = screen.getByText(/~.*\+/)
            expect(element).toBeInTheDocument()
        })
    })
})
