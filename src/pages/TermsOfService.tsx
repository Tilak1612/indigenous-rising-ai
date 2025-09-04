import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';
import { Scale, FileText, AlertTriangle, Shield, Users, Gavel } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Scale className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Legal terms governing your use of the Indigenous Rising AI Business Support Platform
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {new Date().toLocaleDateString('en-CA')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Canadian Law Notice */}
          <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Governed by Canadian Law</h3>
                <p className="text-muted-foreground">
                  These terms are governed by the laws of Canada and the province in which you reside. 
                  They comply with Canadian consumer protection laws, privacy legislation (PIPEDA), 
                  and respect Indigenous rights as recognized in Canadian law.
                </p>
              </div>
            </div>
          </Card>

          {/* Acceptance of Terms */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-semibold text-foreground">Acceptance of Terms</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                By accessing or using the Indigenous Rising AI Business Support Platform ("Service"), you agree 
                to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, 
                you may not access the Service.
              </p>
              
              <p className="text-muted-foreground">
                These Terms apply to all visitors, users, and others who access or use the Service, 
                with special consideration for Indigenous entrepreneurs and communities across Canada.
              </p>
            </div>
          </Card>

          {/* Service Description */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-semibold text-foreground">Service Description</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Our platform provides AI-powered business support services specifically designed for 
                Indigenous entrepreneurs and businesses across Canada, including:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Culturally appropriate business planning and strategy tools</li>
                <li>Access to Indigenous business networks and partnerships</li>
                <li>Training programs respecting traditional knowledge systems</li>
                <li>AI-assisted market analysis and business development support</li>
                <li>Community-centered approach to business growth</li>
              </ul>
            </div>
          </Card>

          {/* User Responsibilities */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-semibold text-foreground">User Responsibilities</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Account Security</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Provide accurate and current information</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Acceptable Use</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Use the Service for lawful business purposes only</li>
                  <li>Respect Indigenous cultural protocols and intellectual property</li>
                  <li>Not interfere with or disrupt the Service</li>
                  <li>Not attempt to gain unauthorized access to our systems</li>
                  <li>Comply with all applicable Canadian laws and regulations</li>
                </ul>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Prohibited Activities</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Cultural appropriation or misuse of Indigenous knowledge</li>
                  <li>Harassment, discrimination, or harmful behavior</li>
                  <li>Spam, fraud, or misleading business practices</li>
                  <li>Violation of intellectual property rights</li>
                  <li>Any activity that violates Canadian law</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Intellectual Property */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Intellectual Property Rights</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">Respect for Indigenous Knowledge</h3>
                <p className="text-muted-foreground">
                  We recognize and respect Indigenous intellectual property rights, traditional knowledge, 
                  and cultural expressions. Our platform is designed to support Indigenous entrepreneurs 
                  while protecting their cultural heritage and traditional practices.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Platform Content</h3>
                <p className="text-muted-foreground">
                  The Service and its original content, features, and functionality are owned by 
                  Indigenous Rising AI Business Support Platform and are protected by Canadian and international 
                  copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">User Content</h3>
                <p className="text-muted-foreground">
                  You retain ownership of any content you submit to the Service. By submitting content, 
                  you grant us a non-exclusive, royalty-free license to use, display, and distribute 
                  your content solely for providing and improving our services, with respect for 
                  Indigenous data sovereignty principles.
                </p>
              </div>
            </div>
          </Card>

          {/* Privacy & Data Protection */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Privacy & Data Protection</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Your privacy is protected under our Privacy Policy, which complies with:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Personal Information Protection and Electronic Documents Act (PIPEDA)</li>
                <li>Provincial privacy legislation where applicable</li>
                <li>Indigenous data sovereignty principles</li>
                <li>Canadian Anti-Spam Legislation (CASL)</li>
              </ul>
              
              <p className="text-muted-foreground">
                Please review our Privacy Policy for detailed information about how we collect, 
                use, and protect your personal information.
              </p>
            </div>
          </Card>

          {/* Liability & Disclaimers */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Gavel className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-semibold text-foreground">Liability & Disclaimers</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Service Availability</h3>
                <p className="text-muted-foreground">
                  We strive to maintain service availability but cannot guarantee uninterrupted access. 
                  We reserve the right to modify, suspend, or discontinue the Service with reasonable notice.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Business Advice Disclaimer</h3>
                <p className="text-muted-foreground">
                  Our AI-powered tools provide general business guidance and should not replace professional 
                  legal, financial, or business advice. Consult qualified professionals for specific business decisions.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by Canadian law, we shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages arising from your use of the Service.
                </p>
              </div>
            </div>
          </Card>

          {/* Termination */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Termination</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We may terminate or suspend your account and access to the Service immediately, 
                without prior notice, for conduct that we believe violates these Terms or is harmful 
                to other users, us, or third parties, or for any other reason.
              </p>
              
              <p className="text-muted-foreground">
                Upon termination, your right to use the Service will cease immediately. 
                We will provide reasonable notice when possible and assist with data export 
                in accordance with our Privacy Policy.
              </p>
            </div>
          </Card>

          {/* Dispute Resolution */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Dispute Resolution</h2>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We encourage resolving disputes through direct communication. If a dispute cannot 
                be resolved informally, it will be resolved through:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                <li>Mediation through a qualified Canadian mediator</li>
                <li>If mediation fails, binding arbitration under Canadian arbitration rules</li>
                <li>For Indigenous users, consideration of traditional dispute resolution methods where appropriate</li>
              </ol>
              
              <p className="text-muted-foreground">
                These Terms are governed by Canadian federal law and the laws of the province 
                where you reside, without regard to conflict of law principles.
              </p>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Contact Information</h2>
            
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                Indigenous Rising AI Business Support Platform<br />
                Email: legal@indigenousrising.ai<br />
                Phone: 1-800-XXX-XXXX<br />
                Address: [Physical Address]<br />
                Canada
              </p>
            </div>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;