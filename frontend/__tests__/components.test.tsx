import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  );
});

describe('UI Components', () => {
  it('renders Button component', async () => {
    const { Button } = await import('@/components/ui');
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders Card component', async () => {
    const { Card } = await import('@/components/ui');
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders Badge component', async () => {
    const { Badge } = await import('@/components/ui');
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders Input component', async () => {
    const { Input } = await import('@/components/ui');
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  it('renders Skeleton component', async () => {
    const { Skeleton } = await import('@/components/ui');
    const { container } = render(<Skeleton className="h-4 w-20" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('renders Spinner component', async () => {
    const { Spinner } = await import('@/components/ui');
    const { container } = render(<Spinner />);
    expect(container.firstChild).toHaveClass('animate-spin');
  });
});

describe('Common Components', () => {
  it('renders EmptyState component', async () => {
    const { EmptyState } = await import('@/components/common');
    render(<EmptyState title="Nothing here" description="No items found" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders ErrorState component', async () => {
    const { ErrorState } = await import('@/components/common');
    render(<ErrorState title="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
