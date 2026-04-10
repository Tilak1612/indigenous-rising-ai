import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';
import { Shield, Eye, Lock, FileText, AlertTriangle, Mail } from 'lucide-react';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Privacy Policy | PIPEDA Compliant | Indigenous Rising AI"
        description="Our commitment to protecting your privacy in accordance with Canadian privacy laws, including PIPEDA. Learn how we collect, use, and protect your personal information."
        ogImage="https://www.indigenousrising.ai/og-privacy.jpg"
      />
      <Navigation />
      
      <div className="pt-16">
        <Breadcrumbs className="container mx-auto bg-muted border-b" />
        
        <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our commitment to protecting your privacy in accordance with Canadian privacy laws, including PIPEDA
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {new Date().toLocaleDateString('en-CA')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* PIPEDA Compliance Notice */}
          <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">PIPEDA Compliance</h3>
                <p className="text-muted-foreground">
                  This privacy policy complies with the Personal Information Protection and Electronic Documents Act (PIPEDA) 
                  and other applicable Canadian privacy legislation. We are committed to protecting the privacy and confidentiality 
                  of personal information in our custody or control.
                </p>
              </div>
            </div>
          </Card>

          {/* Information We Collect */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-semibold text-foreground">Information We Collect</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Name and contact information (email, phone, address)</li>
                  <li>Business information and Indigenous community affiliation</li>
                  <li>Account credentials and authentication data</li>
                  <li>Payment and billing information</li>
                  <li>Communications and support inquiries</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Technical Information</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>IP address, browser type, and device information</li>
                  <li>Usage patterns and platform interactions</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Performance and analytics data</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* How We Use Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-semibold text-foreground">How We Use Your Information</h2>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Service Delivery</h3>
                <p className="text-muted-foreground">
                  To provide AI-powered business support services, maintain your account, process payments, 
                  and deliver personalized content respecting Indigenous business practices.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Communication</h3>
                <p className="text-muted-foreground">
                  To send service updates, respond to inquiries, provide customer support, 
                  and share relevant business resources and opportunities.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Platform Improvement</h3>
                <p className="text-muted-foreground">
                  To analyze usage patterns, improve our services, develop new features, 
                  and ensure cultural appropriateness of our AI tools.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Legal Compliance</h3>
                <p className="text-muted-foreground">
                  To comply with Canadian laws, respond to legal requests, protect our rights, 
                  and prevent fraud or misuse of our platform.
                </p>
              </div>
            </div>
          </Card>

          {/* Data Protection & Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-semibold text-foreground">Data Protection & Security</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We implement comprehensive security measures to protect your personal information:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>End-to-end encryption for data transmission and storage</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and employee training on privacy protection</li>
                <li>Secure data centers located within Canada when possible</li>
                <li>Regular backups with encrypted storage</li>
                <li>Incident response procedures for data breaches</li>
              </ul>
              
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">Indigenous Data Sovereignty</h3>
                <p className="text-muted-foreground">
                  We respect Indigenous data sovereignty principles and work with Indigenous communities 
                  to ensure data governance aligns with their values and self-determination rights.
                </p>
              </div>
            </div>
          </Card>

          {/* Your Rights Under PIPEDA */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Your Rights Under PIPEDA</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Access</h3>
                <p className="text-muted-foreground">
                  Request access to your personal information we hold and how it's being used.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Correction</h3>
                <p className="text-muted-foreground">
                  Request correction of inaccurate or incomplete personal information.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Withdrawal</h3>
                <p className="text-muted-foreground">
                  Withdraw consent for certain uses of your personal information.
                </p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Complaints</h3>
                <p className="text-muted-foreground">
                  File complaints with us or the Privacy Commissioner of Canada.
                </p>
              </div>
            </div>
          </Card>

          {/* Data Retention */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain personal information only as long as necessary for the purposes identified or as required by law:
            </p>
            
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Account information: Until account deletion plus 7 years for legal compliance</li>
              <li>Payment records: 7 years as required by Canadian tax and business laws</li>
              <li>Support communications: 3 years for service improvement</li>
              <li>Analytics data: Anonymized after 2 years, aggregated data retained indefinitely</li>
            </ul>
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-display font-semibold text-foreground">Contact Our Privacy Officer</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                If you have questions about this privacy policy or wish to exercise your privacy rights:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Privacy Officer</h3>
                  <p className="text-muted-foreground">
                    Indigenous Rising AI Business Support Platform<br />
                    Email: privacy@indigenousrising.ai<br />
                    Phone: 1-800-XXX-XXXX<br />
                    Address: [Physical Address]<br />
                    Canada
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Privacy Commissioner of Canada</h3>
                  <p className="text-muted-foreground">
                    If you're not satisfied with our response:<br />
                    Website: priv.gc.ca<br />
                    Phone: 1-800-282-1376<br />
                    Email: info@priv.gc.ca
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;