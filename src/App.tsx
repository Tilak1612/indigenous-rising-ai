import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from "react";
import AccessibilityToolbar from "./components/AccessibilityToolbar";
import CookieConsent from "./components/CookieConsent";
import ComplianceBanner from "./components/ComplianceBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { 
  DashboardSkeleton, 
  BusinessPlannerSkeleton, 
  ResourcesSkeleton, 
  PageSkeleton 
} from "./components/skeletons";

// Lazy load route components
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const AccessibilityStatement = lazy(() => import("./pages/AccessibilityStatement"));
const CanadianCompliance = lazy(() => import("./pages/CanadianCompliance"));
const DataRights = lazy(() => import("./pages/DataRights"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const TrackRequest = lazy(() => import("./pages/TrackRequest"));
const Contact = lazy(() => import("./pages/Contact"));
const Training = lazy(() => import("./pages/Training"));
const FundingDetail = lazy(() => import("./pages/FundingDetail"));
const FeatureDetail = lazy(() => import("./pages/FeatureDetail"));
const OnboardingPage = lazy(() => import("./pages/Onboarding"));
const TestSubscription = lazy(() => import("./pages/TestSubscription"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Pricing = lazy(() => import("./pages/Pricing"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PublicFunding = lazy(() => import("./pages/PublicFunding"));
const PublicPlan = lazy(() => import("./pages/PublicPlan"));
const PublicImpact = lazy(() => import("./pages/PublicImpact"));
const PublicLearning = lazy(() => import("./pages/PublicLearning"));
const SuccessStories = lazy(() => import("./pages/SuccessStories"));
const Careers = lazy(() => import("./pages/Careers"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BusinessTools = lazy(() => import("./pages/dashboard/BusinessTools"));
const BusinessPlanner = lazy(() => import("./pages/dashboard/BusinessPlanner"));
const Resources = lazy(() => import("./pages/dashboard/Resources"));
const Forum = lazy(() => import("./pages/dashboard/Forum"));
const Compliance = lazy(() => import("./pages/dashboard/Compliance"));
const DashboardFunding = lazy(() => import("./pages/dashboard/Funding"));
const Analytics = lazy(() => import("./pages/dashboard/Analytics"));
const Network = lazy(() => import("./pages/dashboard/Network"));
const Certifications = lazy(() => import("./pages/dashboard/Certifications"));
const Templates = lazy(() => import("./pages/dashboard/Templates"));
const ApiAccess = lazy(() => import("./pages/dashboard/ApiAccess"));
const Team = lazy(() => import("./pages/dashboard/Team"));
const Security = lazy(() => import("./pages/dashboard/Security"));
const Integrations = lazy(() => import("./pages/dashboard/Integrations"));
const TrainingCalendar = lazy(() => import("./pages/dashboard/TrainingCalendar"));
const Support = lazy(() => import("./pages/dashboard/Support"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route 
                path="/" 
                element={
                  <Suspense fallback={<PageSkeleton variant="landing" />}>
                    <Index />
                  </Suspense>
                } 
              />
              <Route 
                path="/privacy" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <PrivacyPolicy />
                  </Suspense>
                } 
              />
              <Route 
                path="/terms" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <TermsOfService />
                  </Suspense>
                } 
              />
              <Route 
                path="/accessibility" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <AccessibilityStatement />
                  </Suspense>
                } 
              />
              <Route 
                path="/compliance" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <CanadianCompliance />
                  </Suspense>
                } 
              />
              <Route 
                path="/data-rights" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <DataRights />
                  </Suspense>
                } 
              />
              <Route 
                path="/unsubscribe" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <Unsubscribe />
                  </Suspense>
                } 
              />
              <Route 
                path="/track-request" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <TrackRequest />
                  </Suspense>
                } 
              />
              <Route 
                path="/contact" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <Contact />
                  </Suspense>
                } 
              />
              <Route 
                path="/training" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <Training />
                  </Suspense>
                } 
              />
              <Route 
                path="/auth" 
                element={
                  <Suspense fallback={<PageSkeleton variant="auth" />}>
                    <Auth />
                  </Suspense>
                } 
              />
              <Route 
                path="/funding/:id"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <FundingDetail />
                  </Suspense>
                }
              />
              <Route
                path="/features/:slug"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <FeatureDetail />
                  </Suspense>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ProtectedRoute>
                      <OnboardingPage />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route 
                path="/admin" 
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requireAdmin>
                      <Admin />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              <Route 
                path="/test-subscription" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ProtectedRoute>
                      <TestSubscription />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              <Route
                path="/dashboard/business-tools"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute>
                      <BusinessTools />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/funding"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <DashboardFunding />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/analytics"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <Analytics />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/plan"
                element={
                  <Suspense fallback={<BusinessPlannerSkeleton />}>
                    <ProtectedRoute>
                      <BusinessPlanner />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/resources"
                element={
                  <Suspense fallback={<ResourcesSkeleton />}>
                    <ProtectedRoute>
                      <Resources />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/forum"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute>
                      <Forum />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/community"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute>
                      <Forum />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/compliance"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute>
                      <Compliance />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/network"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <Network />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/certifications"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <Certifications />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/templates"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <Templates />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/api"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <ApiAccess />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/team"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <Team />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/security"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <Security />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/integrations"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <Integrations />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/training-calendar"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <TrainingCalendar />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/support"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute requirePaid>
                      <Support />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/profile"
                element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  </Suspense>
                }
              />
              <Route 
                path="/cookies" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <CookiePolicy />
                  </Suspense>
                } 
              />
              <Route 
                path="/faq" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <FAQ />
                  </Suspense>
                } 
              />
              <Route 
                path="/success-stories" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <SuccessStories />
                  </Suspense>
                } 
              />
              <Route
                path="/careers"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <Careers />
                  </Suspense>
                }
              />
              <Route 
                path="/pricing" 
                element={
                  <Suspense fallback={<PageSkeleton variant="landing" />}>
                    <Pricing />
                  </Suspense>
                } 
              />
              <Route 
                path="/blog" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <Blog />
                  </Suspense>
                } 
              />
              <Route 
                path="/blog/:slug" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <BlogPost />
                  </Suspense>
                } 
              />
              <Route 
                path="/funding" 
                element={
                  <Suspense fallback={<PageSkeleton variant="landing" />}>
                    <PublicFunding />
                  </Suspense>
                } 
              />
              <Route 
                path="/plan" 
                element={
                  <Suspense fallback={<PageSkeleton variant="landing" />}>
                    <PublicPlan />
                  </Suspense>
                } 
              />
              <Route 
                path="/impact" 
                element={
                  <Suspense fallback={<PageSkeleton variant="landing" />}>
                    <PublicImpact />
                  </Suspense>
                } 
              />
              <Route 
                path="/learning" 
                element={
                  <Suspense fallback={<PageSkeleton variant="landing" />}>
                    <PublicLearning />
                  </Suspense>
                } 
              />
              <Route 
                path="/success-stories" 
                element={
                  <Suspense fallback={<PageSkeleton variant="landing" />}>
                    <SuccessStories />
                  </Suspense>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route
                path="*" 
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <NotFound />
                  </Suspense>
                } 
              />
            </Routes>
              <AccessibilityToolbar />
              <CookieConsent />
              <ComplianceBanner />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);
};

export default App;