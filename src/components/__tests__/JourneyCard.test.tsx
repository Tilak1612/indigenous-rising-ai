import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import JourneyCard from '@/components/JourneyCard';

describe('JourneyCard', () => {
  test('renders stage, actions and progress', () => {
    render(<JourneyCard stage="Starting" topActions={["A","B","C"]} progress={33} />);
    expect(screen.getByText('Starting')).toBeDefined();
    expect(screen.getByText('• A')).toBeDefined();
    expect(screen.getByText('33%')).toBeDefined();
  });
});
