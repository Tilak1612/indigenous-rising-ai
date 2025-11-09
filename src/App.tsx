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

// Lazy load route components
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const AccessibilityStatement = lazy(() => import("./pages/AccessibilityStatement"));
const CanadianCompliance = lazy(() => import("./pages/CanadianCompliance"));
const DataRights = lazy(() => import("./pages/DataRights"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const TrackRequest = lazy(() => import("./pages/TrackRequest"));
const Contact = lazy(() => import("./pages/Contact"));

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
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
