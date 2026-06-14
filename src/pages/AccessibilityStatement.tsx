import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';
import { 
  Accessibility, 
  Eye, 
  Keyboard, 
  Monitor, 
  Volume2, 
  Mouse, 
  CheckCircle,
  AlertCircle,
  Mail,
  FileText
} from 'lucide-react';

const AccessibilityStatement: React.FC = () => {
  return (
    <div className="min-h-screen warm-page">
      <Helmet>
        <title>Accessibility Statement - Indigenous Rising AI</title>
        <meta name="description" content="Our commitment to digital accessibility for Indigenous entrepreneurs. WCAG 2.1 Level AA compliance, assistive technology support, and inclusive design." />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.indigenousrising.ai/accessibility" />
        <meta property="og:title" content="Accessibility Statement - Indigenous Rising AI" />
        <meta property="og:description" content="WCAG 2.1 compliant platform for Indigenous entrepreneurs across Canada." />
        <meta property="og:image" content="https://www.indigenousrising.ai/og-home.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.indigenousrising.ai/accessibility" />
        <meta name="twitter:title" content="Accessibility Statement - Indigenous Rising AI" />
        <meta name="twitter:description" content="WCAG 2.1 compliant platform for Indigenous entrepreneurs." />
        <meta name="twitter:image" content="https://www.indigenousrising.ai/og-home.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.indigenousrising.ai/accessibility" />
      </Helmet>
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Accessibility className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Accessibility Statement
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our commitment to making our platform accessible to all users, in compliance with AODA and WCAG 2.1 AA standards
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {/* Fixed review date — not new Date(), which perpetually (and falsely)
                stamped "today". Bump this when the statement is actually revised. */}
            Last updated: 2026-06-14
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* AODA Compliance Notice */}
          <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">AODA & WCAG 2.1 AA Compliance</h3>
                <p className="text-muted-foreground">
                  This website is designed to comply with the Accessibility for Ontarians with Disabilities Act (AODA) 
                  and meets Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. We are committed to 
                  ensuring our platform is accessible to all users, regardless of ability.
                </p>
              </div>
            </div>
          </Card>

          {/* Our Commitment */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Our Accessibility Commitment</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                The Indigenous Rising AI Business Support Platform is committed to ensuring digital accessibility 
                for people with disabilities. We continually improve the user experience for everyone and 
                apply relevant accessibility standards to achieve these goals.
              </p>
              
              <p className="text-muted-foreground">
                We believe that all Indigenous entrepreneurs, regardless of ability, should have equal 
                access to business support tools and resources. This commitment reflects our values of 
                inclusion, respect, and community support.
              </p>
            </div>
          </Card>

          {/* Accessibility Features */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-6">Accessibility Features</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Visual Accessibility */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Visual</h3>
                </div>
                <ul className="list-none space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    High contrast mode available
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Adjustable text size (75%-150%)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Color contrast ratios meet WCAG AA
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    No information conveyed by color alone
                  </li>
                </ul>
              </div>

              {/* Keyboard Navigation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Keyboard</h3>
                </div>
                <ul className="list-none space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Full keyboard navigation support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Visible focus indicators
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Logical tab order throughout
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Skip navigation links provided
                  </li>
                </ul>
              </div>

              {/* Screen Reader Support */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Screen Readers</h3>
                </div>
                <ul className="list-none space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Semantic HTML structure
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Descriptive alt text for images
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    ARIA labels and landmarks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Form labels and instructions
                  </li>
                </ul>
              </div>

              {/* Motor Accessibility */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mouse className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Motor</h3>
                </div>
                <ul className="list-none space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Large clickable areas (44px minimum)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    No time-based interactions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Drag and drop alternatives
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Motion can be disabled
                  </li>
                </ul>
              </div>

              {/* Cognitive Support */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Cognitive</h3>
                </div>
                <ul className="list-none space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Clear, consistent navigation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Simple, plain language
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Error prevention and recovery
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Reduced motion options
                  </li>
                </ul>
              </div>

              {/* Mobile Accessibility */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Mobile</h3>
                </div>
                <ul className="list-none space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Responsive design for all devices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Touch-friendly interface
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Portrait and landscape support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Mobile screen reader compatible
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Testing & Compliance */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Testing & Compliance Methods</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We employ multiple testing methods to ensure accessibility compliance:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Automated Testing</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>WAVE Web Accessibility Evaluator</li>
                    <li>axe accessibility testing engine</li>
                    <li>Lighthouse accessibility audits</li>
                    <li>Color contrast analyzers</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Manual Testing</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Screen reader testing (NVDA, JAWS, VoiceOver)</li>
                    <li>Keyboard-only navigation testing</li>
                    <li>Mobile accessibility testing</li>
                    <li>User testing with disability communities</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* Known Issues */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-warning" />
              <h2 className="text-2xl font-display font-semibold text-foreground">Known Issues & Improvements</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We are continuously working to improve accessibility. Current known issues include:
              </p>
              
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <h3 className="font-semibold text-foreground mb-2">In Progress</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Enhanced voice control compatibility (on our roadmap)</li>
                  <li>Additional language support for Indigenous languages (ongoing)</li>
                  <li>Improved mobile accessibility for complex forms (in progress)</li>
                </ul>
              </div>
              
              <p className="text-muted-foreground">
                We prioritize accessibility improvements based on user feedback and community needs. 
                If you encounter any accessibility barriers, please contact us immediately.
              </p>
            </div>
          </Card>

          {/* Third-Party Content */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Third-Party Content</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Some content on our platform may be provided by third parties. While we strive to ensure 
                all content meets our accessibility standards:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>We work with partners to maintain accessibility compliance</li>
                <li>We provide alternative formats when possible</li>
                <li>We welcome reports of inaccessible third-party content</li>
                <li>We commit to finding accessible alternatives</li>
              </ul>
            </div>
          </Card>

          {/* Feedback & Contact */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-semibold text-foreground">Accessibility Feedback</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Your feedback helps us improve accessibility for everyone. Please contact us if you:
              </p>
              
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Encounter accessibility barriers on our platform</li>
                <li>Need content in an alternative format</li>
                <li>Have suggestions for accessibility improvements</li>
                <li>Require assistance using our services</li>
              </ul>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Accessibility Coordinator</h3>
                  <p className="text-muted-foreground text-sm">
                    Email: help@indigenousrising.ai<br />
                    Response time: Within 2 business days
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Alternative Formats</h3>
                  <p className="text-muted-foreground text-sm">
                    We can provide content in:<br />
                    • Large print • Braille • Audio format<br />
                    • Plain text • Easy-read versions<br />
                    • Indigenous language translations
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Legal Compliance */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-semibold text-foreground">Legal Compliance</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This accessibility statement demonstrates our compliance with:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Canadian Standards</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Accessibility for Ontarians with Disabilities Act (AODA)</li>
                    <li>Canadian Human Rights Act</li>
                    <li>Employment Equity Act</li>
                    <li>Provincial accessibility legislation</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">International Standards</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>WCAG 2.1 Level AA guidelines</li>
                    <li>Section 508 compliance</li>
                    <li>EN 301 549 European standard</li>
                    <li>ISO/IEC 40500:2012</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AccessibilityStatement;