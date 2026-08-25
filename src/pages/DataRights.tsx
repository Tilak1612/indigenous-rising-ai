import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import DataRequestForm from '../components/DataRequestForm';
import { Shield, CheckCircle, Clock, FileText, Lock, Scale, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const DataRights = () => {
  const rights = [
    {
      icon: FileText,
      title: 'Right to Access',
      description: 'Request a copy of all personal information we hold about you, including how it\'s being used.'
    },
    {
      icon: CheckCircle,
      title: 'Right to Correction',
      description: 'Request corrections to any inaccurate or incomplete personal information.'
    },
    {
      icon: Lock,
      title: 'Right to Deletion',
      description: 'Request deletion of your personal information, subject to legal retention requirements.'
    },
    {
      icon: Shield,
      title: 'Right to Withdraw Consent',
      description: 'Withdraw your consent for specific data processing activities at any time.'
    },
    {
      icon: Scale,
      title: 'Right to Data Portability',
      description: 'Receive your data in a structured, commonly used, machine-readable format.'
    },
    {
      icon: Clock,
      title: 'Right to Timely Response',
      description: 'Receive a response to your request within 30 days, as required by PIPEDA.'
    }
  ];

  return (
    <div className="min-h-screen warm-page">
      <Helmet>
        <title>Your Data Rights | PIPEDA Compliance | Indigenous Rising AI</title>
        <meta 
          name="description" 
          content="Exercise your PIPEDA data rights. Request access, correction, or deletion of your personal information under Canadian privacy law." 
        />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.indigenousrising.ai/data-rights" />
        <meta property="og:title" content="Your Data Rights - PIPEDA Compliance" />
        <meta property="og:description" content="Exercise your data rights under PIPEDA. Access, correct, or delete your personal information." />
        <meta property="og:image" content="https://www.indigenousrising.ai/og-data-rights.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.indigenousrising.ai/data-rights" />
        <meta name="twitter:title" content="Your Data Rights - PIPEDA Compliance" />
        <meta name="twitter:description" content="Exercise your data rights under PIPEDA." />
        <meta name="twitter:image" content="https://www.indigenousrising.ai/og-data-rights.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.indigenousrising.ai/data-rights" />
      </Helmet>

      <Navigation />
      
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Your Data Rights Under PIPEDA
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
            As a Canadian organization, we respect your rights under the Personal Information Protection 
            and Electronic Documents Act (PIPEDA). You have control over your personal information.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString('en-CA')}
          </p>
          <Link to="/track-request">
            <Button variant="outline" className="gap-2">
              <Search className="w-4 h-4" />
              Track Your Request
            </Button>
          </Link>
        </div>

        {/* Rights Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {rights.map((right, index) => {
            const Icon = right.icon;
            return (
              <Card 
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">
                  {right.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {right.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-3 text-foreground">
              How We Process Your Request
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Submit your request using the form below</li>
              <li>We verify your identity to protect your privacy</li>
              <li>We process your request within 30 days</li>
              <li>You receive our response via secure email</li>
              <li>If needed, we may extend by 30 days with explanation</li>
            </ol>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-3 text-foreground">
              What Information Do We Need?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Your full legal name</li>
              <li>• Email address associated with your account</li>
              <li>• Specific details about your request</li>
              <li>• Additional identity verification may be required</li>
              <li>• All requests are processed securely</li>
            </ul>
          </Card>
        </div>

        {/* Request Form */}
        <div className="mb-12">
          <DataRequestForm />
        </div>

        {/* Additional Information */}
        <Card className="p-8 bg-muted/30">
          <h2 className="font-display text-2xl font-bold mb-4 text-foreground">
            Additional Information
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Response Time:</strong> We will respond to your request 
              within 30 days. In some cases, we may extend this period by an additional 30 days if necessary, 
              and we will inform you of the extension and the reason for it.
            </p>
            <p>
              <strong className="text-foreground">Fees:</strong> We do not charge fees for most data rights 
              requests. However, if your request is manifestly unfounded or excessive, we may charge a 
              reasonable fee or refuse to act on the request.
            </p>
            <p>
              <strong className="text-foreground">Complaints:</strong> If you are not satisfied with how 
              we handle your request, you have the right to file a complaint with the Office of the Privacy 
              Commissioner of Canada at{' '}
              <a 
                href="https://www.priv.gc.ca/en/report-a-concern/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.priv.gc.ca
              </a>
            </p>
            <p>
              <strong className="text-foreground">Contact Us:</strong> For urgent privacy matters or 
              questions about your data rights, contact our Privacy Officer directly:
            </p>
            <div className="pl-4 border-l-2 border-primary">
              <p className="font-medium text-foreground">Privacy Officer</p>
              <p>Email: <a href="mailto:privacy@indigenousrising.ai" className="text-primary hover:underline">privacy@indigenousrising.ai</a></p>
              <p>Address: Traditional Territory of the Anishinaabe, Toronto, ON</p>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default DataRights;
