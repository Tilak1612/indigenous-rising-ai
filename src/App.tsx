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
import { LoadingSpinner } from "./components/ui/loading-spinner";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
const TestSubscription = lazy(() => import("./pages/TestSubscription"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const FAQ = lazy(() => import("./pages/FAQ"));

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

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
                  <Suspense fallback={<LoadingFallback />}>
                    <Index />
                  </Suspense>
                } 
              />
              <Route 
                path="/privacy" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PrivacyPolicy />
                  </Suspense>
                } 
              />
              <Route 
                path="/terms" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <TermsOfService />
                  </Suspense>
                } 
              />
              <Route 
                path="/accessibility" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AccessibilityStatement />
                  </Suspense>
                } 
              />
              <Route 
                path="/compliance" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <CanadianCompliance />
                  </Suspense>
                } 
              />
              <Route 
                path="/data-rights" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DataRights />
                  </Suspense>
                } 
              />
              <Route 
                path="/unsubscribe" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Unsubscribe />
                  </Suspense>
                } 
              />
              <Route 
                path="/track-request" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <TrackRequest />
                  </Suspense>
                } 
              />
              <Route 
                path="/contact" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Contact />
                  </Suspense>
                } 
              />
              <Route 
                path="/training" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Training />
                  </Suspense>
                } 
              />
              <Route 
                path="/auth" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Auth />
                  </Suspense>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute requireAdmin>
                      <Admin />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              <Route 
                path="/test-subscription" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProtectedRoute>
                      <TestSubscription />
                    </ProtectedRoute>
                  </Suspense>
                } 
              />
              <Route 
                path="/cookies" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <CookiePolicy />
                  </Suspense>
                } 
              />
              <Route 
                path="/faq" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <FAQ />
                  </Suspense>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route
                path="*" 
                element={
                  <Suspense fallback={<LoadingFallback />}>
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

export default App;
