import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Mail, FileText, Settings, LogOut } from 'lucide-react';
import NewsletterManagement from '@/components/admin/NewsletterManagement';
import DataRequestsManagement from '@/components/admin/DataRequestsManagement';
import ContentManagement from '@/components/admin/ContentManagement';

export default function Admin() {
  const { user, signOut, isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have admin permissions.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Indigenous Rising AI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <ShinyButton size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2 inline-block" />
                Sign Out
              </ShinyButton>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="newsletter" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="newsletter">
                <Mail className="w-4 h-4 mr-2" />
                Newsletter
              </TabsTrigger>
              <TabsTrigger value="data-requests">
                <FileText className="w-4 h-4 mr-2" />
                Data Requests
              </TabsTrigger>
              <TabsTrigger value="content">
                <Settings className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="newsletter">
              <NewsletterManagement />
            </TabsContent>

            <TabsContent value="data-requests">
              <DataRequestsManagement />
            </TabsContent>

            <TabsContent value="content">
              <ContentManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}