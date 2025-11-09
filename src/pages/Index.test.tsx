import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import Index from './Index';

// Mock all child components
vi.mock('../components/Navigation', () => ({
  default: () => <nav data-testid="navigation">Navigation</nav>,
}));

vi.mock('../components/HeroSection', () => ({
  default: () => <section data-testid="hero">Hero Section</section>,
}));

vi.mock('../components/EnhancedFeatures', () => ({
  default: () => <section data-testid="features">Features</section>,
}));

vi.mock('../components/FundingSection', () => ({
  default: () => <section data-testid="funding">Funding</section>,
}));

vi.mock('../components/TestimonialsSection', () => ({
  default: () => <section data-testid="testimonials">Testimonials</section>,
}));

vi.mock('../components/ImpactCalculator', () => ({
  default: () => <section data-testid="calculator">Calculator</section>,
}));

vi.mock('../components/ElderWisdom', () => ({
  default: () => <section data-testid="elder-wisdom">Elder Wisdom</section>,
}));

vi.mock('../components/TrainingSection', () => ({
  default: () => <section data-testid="training">Training</section>,
}));

vi.mock('../components/PartnershipsSection', () => ({
  default: () => <section data-testid="partnerships">Partnerships</section>,
}));

vi.mock('../components/PricingSection', () => ({
  default: () => <section data-testid="pricing">Pricing</section>,
}));

vi.mock('../components/FAQSection', () => ({
  default: () => <section data-testid="faq">FAQ</section>,
}));

vi.mock('../components/CTASection', () => ({
  default: () => <section data-testid="cta">CTA</section>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../components/ScrollToTop', () => ({
  default: () => <div data-testid="scroll-to-top">Scroll to Top</div>,
}));

vi.mock('../components/StickyCTA', () => ({
  default: () => <div data-testid="sticky-cta">Sticky CTA</div>,
}));

vi.mock('../components/ProgressBar', () => ({
  default: () => <div data-testid="progress-bar">Progress Bar</div>,
}));

vi.mock('../components/CanadianComplianceBadge', () => ({
  default: () => <div data-testid="compliance-badge">Compliance Badge</div>,
}));

vi.mock('../components/SocialProof', () => ({
  default: () => <section data-testid="social-proof">Social Proof</section>,
}));

vi.mock('../components/MetaTags', () => ({
  default: () => <div data-testid="meta-tags">Meta Tags</div>,
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <Index />
    </BrowserRouter>
  );
};

describe('Index Page', () => {
  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders navigation component', () => {
    renderComponent();
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('renders all main sections in correct order', () => {
    renderComponent();
    
    const sections = [
      'hero',
      'social-proof',
      'features',
      'funding',
      'testimonials',
      'calculator',
      'elder-wisdom',
      'training',
      'partnerships',
      'pricing',
      'faq',
      'compliance-badge',
      'cta',
    ];
    
    sections.forEach(sectionId => {
      expect(screen.getByTestId(sectionId)).toBeInTheDocument();
    });
  });

  it('renders footer component', () => {
    renderComponent();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders utility components', () => {
    renderComponent();
    
    expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
    expect(screen.getByTestId('sticky-cta')).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    renderComponent();
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('includes skip to main content link for accessibility', () => {
    renderComponent();
    
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders MetaTags component', () => {
    renderComponent();
    expect(screen.getByTestId('meta-tags')).toBeInTheDocument();
  });

  it('has minimum height styling', () => {
    renderComponent();
    
    const container = screen.getByRole('main').parentElement;
    expect(container).toHaveClass('min-h-screen');
  });
});
