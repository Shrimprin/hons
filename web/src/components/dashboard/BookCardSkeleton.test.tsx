import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BookCardSkeleton } from './BookCardSkeleton';

describe('BookCardSkeleton', () => {
  it('renders skeleton placeholder', () => {
    const { container } = render(<BookCardSkeleton />);
    const skeleton = container.querySelector('[data-testid="book-skeleton"]');
    expect(skeleton).not.toBeNull();
  });

  it('renders an animated pulse element', () => {
    const { container } = render(<BookCardSkeleton />);
    const animated = container.querySelector('.animate-pulse');
    expect(animated).not.toBeNull();
  });
});
