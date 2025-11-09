import { Helmet } from 'react-helmet-async';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Shield, Check, MapPin, Globe, Lock, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CanadianCompliance = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Canadian Compliance - Indigenous Rising AI</title>
        <meta name="description" content="Indigenous Rising AI adheres to all Canadian federal and provincial regulations. PIPEDA, CASL, AIA, and data sovereignty compliance for Indigenous businesses." />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://indigenousrising.ai/compliance" />
        <meta property="og:title" content="Canadian Compliance Framework - Indigenous Rising AI" />
        <meta property="og:description" content="PIPEDA, CASL, and AIA compliant platform for Indigenous entrepreneurs in Canada." />
        <meta property="og:image" content="https://indigenousrising.ai/og-compliance.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://indigenousrising.ai/compliance" />
        <meta name="twitter:title" content="Canadian Compliance Framework" />
        <meta name="twitter:description" content="PIPEDA, CASL, and AIA compliant for Indigenous businesses." />
        <meta name="twitter:image" content="https://indigenousrising.ai/og-compliance.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://indigenousrising.ai/compliance" />
      </Helmet>
      <Navigation />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary">🍁 Canadian Compliance</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl font-black text-foreground mb-6">
                Canadian Regulatory
                <span className="block gradient-earth bg-clip-text text-transparent">
                  Compliance Framework
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground">
                Indigenous Rising AI adheres to all Canadian federal and provincial regulations 
                governing data privacy, accessibility, and Indigenous rights.
              </p>
            </div>

            {/* Main Compliance Sections */}
            <div className="space-y-8">
              {/* PIPEDA */}
              <Card className="p-8 hover:shadow-elevated transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      PIPEDA Compliance
                    </h2>
                    <p className="text-sm text-primary font-semibold mb-2">
                      Personal Information Protection and Electronic Documents Act
                    </p>
                    <p className="text-muted-foreground">
                      We comply with Canada's federal privacy law governing how private sector organizations 
                      collect, use, and disclose personal information.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Our Commitments:</h3>
                  <ul className="space-y-2">
                    {[
                      'Accountability for personal data protection',
                      'Clear identification of purposes for data collection',
                      'Obtaining meaningful consent before collection',
                      'Limiting collection to necessary information only',
                      'Using, retaining, and disclosing data only as consented',
                      'Maintaining accuracy of personal information',
                      'Implementing appropriate security safeguards',
                      'Being transparent about data management policies',
                      'Providing individuals access to their personal information',
                      'Allowing challenges to compliance with complaints'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* AODA */}
              <Card className="p-8 hover:shadow-elevated transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      AODA Compliance
                    </h2>
                    <p className="text-sm text-secondary font-semibold mb-2">
                      Accessibility for Ontarians with Disabilities Act
                    </p>
                    <p className="text-muted-foreground">
                      Our platform meets WCAG 2.1 Level AA standards and Ontario's accessibility requirements.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Accessibility Features:</h3>
                  <ul className="space-y-2">
                    {[
                      'Keyboard navigation support throughout the platform',
                      'Screen reader optimization with proper ARIA labels',
                      'High contrast mode for visual accessibility',
                      'Adjustable text size and font options',
                      'Clear focus indicators for interactive elements',
                      'Alternative text for all images and media',
                      'Captions and transcripts for video content',
                      'Accessible form design with clear error messages',
                      'Consistent navigation structure',
                      'Touch-friendly interface with minimum target sizes'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* CASL */}
              <Card className="p-8 hover:shadow-elevated transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      CASL Compliance
                    </h2>
                    <p className="text-sm text-accent font-semibold mb-2">
                      Canadian Anti-Spam Legislation
                    </p>
                    <p className="text-muted-foreground">
                      We strictly adhere to Canada's laws governing commercial electronic messages and consent.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Email & Communication Practices:</h3>
                  <ul className="space-y-2">
                    {[
                      'Express consent obtained before sending commercial messages',
                      'Clear identification of sender in all communications',
                      'Easy-to-use unsubscribe mechanism in every message',
                      'Unsubscribe requests honored within 10 business days',
                      'Accurate sender information and contact details',
                      'No misleading subject lines or sender information',
                      'Implied consent used only when legally appropriate',
                      'Consent records maintained for compliance verification',
                      'Third-party consent validated before messaging'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Data Residency */}
              <Card className="p-8 hover:shadow-elevated transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      Canadian Data Residency
                    </h2>
                    <p className="text-sm text-primary font-semibold mb-2">
                      Your data stays in Canada
                    </p>
                    <p className="text-muted-foreground">
                      All user data is stored exclusively on Canadian servers, subject to Canadian jurisdiction.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Data Protection Measures:</h3>
                  <ul className="space-y-2">
                    {[
                      'All data centers located within Canadian borders',
                      'Encryption at rest and in transit (TLS 1.3, AES-256)',
                      'Regular security audits and penetration testing',
                      'Multi-factor authentication for sensitive operations',
                      'Automated backup systems with disaster recovery',
                      'Role-based access controls and audit logging',
                      'Compliance with provincial privacy laws',
                      'No data transfer to foreign jurisdictions without consent',
                      'Annual third-party security assessments'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* OCAP */}
              <Card className="p-8 hover:shadow-elevated transition-all bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 gradient-earth rounded-xl flex items-center justify-center flex-shrink-0 shadow-natural">
                    <Shield className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      OCAP™ Principles
                    </h2>
                    <p className="text-sm text-primary font-semibold mb-2">
                      Indigenous Data Sovereignty
                    </p>
                    <p className="text-muted-foreground">
                      We uphold Indigenous peoples' inherent rights to govern the collection, ownership, 
                      and application of data about their communities.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">O</span>
                      Ownership
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Indigenous communities own information about themselves, their members, 
                      traditional territory, and cultural practices collectively.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">C</span>
                      Control
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Indigenous peoples control all aspects of research and information management 
                      processes affecting them, including creation, use, access, and disclosure.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">A</span>
                      Access
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Indigenous peoples have the right to access data about themselves and their communities, 
                      regardless of where it is held.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-bold text-primary">P</span>
                      Possession
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Indigenous communities have physical control over data, including secure storage 
                      within their jurisdiction and the ability to govern stewardship.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Contact & Reporting */}
              <Card className="p-8 bg-muted/30">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  Questions or Compliance Concerns?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Our Privacy Officer is available to address any questions or concerns about our compliance practices.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="hero" onClick={() => window.open('mailto:privacy@indigenousrising.ai')}>
                    Contact Privacy Officer
                  </Button>
                  <Button variant="outline" onClick={() => window.open('/privacy')}>
                    View Privacy Policy
                  </Button>
                  <Button variant="outline" onClick={() => window.open('/accessibility')}>
                    Accessibility Statement
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CanadianCompliance;
