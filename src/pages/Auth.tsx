import { useState, useEffect } from 'react';
import { readCampaign, saveSignupIntent, readSignupIntent, type PlanKey } from '@/lib/signup-intent';
import { trackEvent } from '@/utils/analytics';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { BrandMark } from '@/components/BrandMark';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Eye, EyeOff } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { DATA_RESIDENCY_LINE } from '@/lib/trust-copy';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Auth() {
  // Default to SIGN-UP when the visitor arrived via a signup CTA. This was
  // hardcoded `useState(true)` — sign-in — so "Start free account", the primary
  // homepage CTA, landed new users on a login form.
  const location = useLocation();

  // Derived from the route, not captured once. Both /auth and /signup render
  // this same element, so React Router re-renders rather than remounts when
  // you move between them — the useState initializer never re-ran, and a
  // client-side <Link to="/signup"> from /auth left the SIGN-IN form on
  // screen. Verified in a browser: fresh /auth showed "Welcome Back", and
  // after an in-app navigation to /signup it still said "Welcome Back".
  const routeWantsSignup = (pathname: string, search: string) => {
    const p = new URLSearchParams(search);
    return pathname === '/signup' || p.get('intent') === 'signup' || p.has('plan');
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLogin, setIsLogin] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !routeWantsSignup(window.location.pathname, window.location.search);
  });

  // Re-sync on every route change. The toggle below still wins afterwards,
  // because this only fires when the path or query actually changes.
  useEffect(() => {
    setIsLogin(!routeWantsSignup(location.pathname, location.search));
  }, [location.pathname, location.search]);

  // Plan + campaign context, captured on arrival so it survives the
  // email-verification round trip (a full page load from another origin).

  // Read from the router's location, not window.location, and re-read when
  // it changes. Previously this was parsed once from window.location inside
  // a mount-only effect, so arriving at /signup?plan=Growth through an
  // in-app link captured no plan at all — the same defect as the sign-in
  // mode not following the route.
  const searchParams = new URLSearchParams(location.search);
  const planFromUrl = (searchParams.get('plan') as PlanKey) ?? undefined;
  const selectedPlan = planFromUrl;
  const billingFromUrl = (searchParams.get('billing') as 'monthly' | 'annual') ?? undefined;
  const campaign = readCampaign(location.search);

  useEffect(() => {
    if (planFromUrl || billingFromUrl || Object.keys(campaign).length > 0) {
      saveSignupIntent({ plan: planFromUrl, billing: billingFromUrl, campaign });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the query string
  }, [location.search]);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Detect password-recovery token in URL hash (Supabase sends #access_token=...&type=recovery)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
  }, []);

  useEffect(() => {
    if (user && !isRecovery) {
      navigate('/dashboard');
    }
  }, [user, navigate, isRecovery]);

  // Google is the only external provider enabled on this project. Verified
  // against the live GoTrue settings endpoint: external.google === true,
  // external.azure === false — so no Microsoft button is offered, rather
  // than shipping one that fails on click.
  const [oauthLoading, setOauthLoading] = useState(false);

  const signInWithGoogle = async () => {
    setError('');
    setOauthLoading(true);
    try {
      // Persist first: OAuth leaves this origin, and the plan/campaign must
      // still be attached when the user comes back.
      saveSignupIntent({ plan: planFromUrl, billing: billingFromUrl, campaign });

      // Carried in the redirect URL as well as sessionStorage, so the context
      // survives even where storage is unavailable (private browsing).
      const back = new URL(`${window.location.origin}/auth`);
      if (planFromUrl) back.searchParams.set('plan', planFromUrl);
      if (billingFromUrl) back.searchParams.set('billing', billingFromUrl);
      for (const [k, v] of Object.entries(campaign)) back.searchParams.set(k, v);

      trackEvent('signup_oauth_started', { provider: 'google', plan: planFromUrl ?? 'none' });

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: back.toString() },
      });
      if (oauthError) throw oauthError;
      // On success the browser navigates away; nothing after this runs.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in');
      setOauthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const validated = loginSchema.parse({ email, password });
        const { error } = await signIn(validated.email, validated.password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password');
          } else {
            setError(error.message);
          }
        }
      } else {
        const validated = signupSchema.parse({ 
          email, 
          password, 
          confirmPassword,
          fullName, 
          terms: termsAccepted 
        });
        const { error } = await signUp(validated.email, validated.password, validated.fullName);
        
        if (error) {
          if (error.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess('Account created successfully! You can now sign in.');
          trackEvent('sign_up', { plan: 'free' });
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
          setTermsAccepted(false);
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setError('');
    setSuccess('');
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password updated successfully. You can now sign in.');
        setIsRecovery(false);
        setPassword('');
        setConfirmPassword('');
        // Clear the hash so the recovery state doesn't re-trigger
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset email sent. Please check your inbox.');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? 'Sign In' : 'Create Account'} - Indigenous Rising AI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="bg-background min-h-screen flex items-center justify-center px-4">
        <div className="container mx-auto">
          <div className="flex justify-center">
            <div className="w-full sm:w-10/12 md:w-8/12 lg:w-6/12 xl:w-4/12">
              {/* Brand header — keeps the auth page on-brand and gives a way back home */}
              <Link
                to="/"
                className="flex items-center justify-center gap-2.5 mb-6 group"
                aria-label="Indigenous Rising AI — home"
              >
                <BrandMark size={36} className="transition-opacity group-hover:opacity-80" />
                <span className="font-display font-semibold text-xl text-foreground tracking-tight">
                  Indigenous Rising
                </span>
              </Link>
              <div className="bg-card p-8 rounded-lg shadow-lg border">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {isRecovery ? 'Set New Password' : isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create an Account'}
                  </h1>
                  <p className="text-muted-foreground">
                    {isRecovery ? 'Choose a new password for your account' : isForgotPassword ? 'Enter your email to receive a reset link' : isLogin ? 'Sign in to your account' : 'Join our community today'}
                  </p>
                </div>

                {/* Value recap at the moment of commitment. The registration
                    screen restated nothing about what the account gives you, so
                    a visitor who arrived from "Start free account" had to
                    remember the pitch from two pages back. Shown only while
                    registering — it is noise on sign-in and password reset.
                    Every figure here is the enforced one: free tier is
                    QUOTA_BY_TIER.free = 3 in match-funding-opportunities, and
                    the free plan genuinely takes no card. */}
                {/* Sets the expectation that a six-question profile follows,
                    so the profile screen does not read as an unannounced
                    second form. Registration only — there is no step 2 when
                    signing in. */}
                {!isLogin && !isForgotPassword && !isRecovery && (
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Step 1 of 2: Create your account
                  </p>
                )}

                {/* Also shown on the default /auth view. It used to render only
                    in registration mode, and the bare /auth route defaults to
                    sign-in — so the front door of the funnel stated no value
                    at all. Every bullet is true for a returning free user too,
                    so it is accurate in both modes. */}
                {!isForgotPassword && !isRecovery && (
                  <ul className="mb-6 space-y-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
                    {[
                      '3 free funding matches every month',
                      'Guided business plan, built section by section',
                      'No credit card required',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                    <li className="pt-1 text-xs text-muted-foreground">
                      Your data is stored in Canada and you can export or delete it at any
                      time — see{' '}
                      <Link to="/data-rights" className="underline">your data rights</Link>.
                    </li>
                  </ul>
                )}

                {isRecovery ? (
                  <form onSubmit={handleSetNewPassword}>
                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-1">
                          New Password
                        </Label>
                        <Input
                          type="password"
                          id="new-password"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
                      </div>
                      <div>
                        <Label htmlFor="confirm-new-password" className="block text-sm font-medium text-foreground mb-1">
                          Confirm New Password
                        </Label>
                        <Input
                          type="password"
                          id="confirm-new-password"
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                      {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Updating...' : 'Set New Password'}
                      </Button>
                    </div>
                  </form>
                ) : null}

                {isForgotPassword && !isRecovery ? (
                  <form onSubmit={handleForgotPassword}>
                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="reset-email" className="block text-sm font-medium text-foreground mb-1">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          id="reset-email"
                          name="email"
                          autoComplete="email"
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                      {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                    </div>
                  </form>
                ) : null}

                {/* Google only: verified against the live GoTrue settings
                    endpoint, external.google is true and external.azure is
                    false. Offering a Microsoft button the provider cannot
                    service would be worse than offering none. Plan and
                    campaign are re-attached to the redirect URL as well as
                    sessionStorage, so the context survives the round trip
                    even in private browsing. */}
                {!isForgotPassword && !isRecovery && (
                  <div className="mb-5">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={signInWithGoogle}
                      disabled={oauthLoading || loading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                        <path fill="#FBBC05" d="M5.85 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.67-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.67 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                      </svg>
                      {oauthLoading
                        ? 'Opening Google…'
                        : isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                    </Button>
                    <div className="my-4 flex items-center gap-3">
                      <span className="h-px flex-1 bg-border" />
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                  </div>
                )}

                {!isForgotPassword && !isRecovery && <form onSubmit={handleSubmit}>
                  <div className="space-y-5">
                    {!isLogin && (
                      <div>
                        <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                          Full Name
                        </Label>
                        <Input
                          type="text"
                          id="name"
                          className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          autoComplete={isLogin ? 'current-password' : 'new-password'}
                          className="w-full px-4 py-2 pr-11 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                          className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-muted-foreground hover:text-foreground"
                        >
                          {showPassword
                            ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                            : <Eye className="h-4 w-4" aria-hidden="true" />}
                        </button>
                      </div>
                      {!isLogin && (
                        <>
                          <p className="text-xs text-muted-foreground mt-1">
                            Password must be at least 8 characters long
                          </p>
                          <PasswordStrength value={password} />
                          {/* Verbatim from /canadian-compliance via a shared
                              constant, so the two surfaces cannot drift. */}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {DATA_RESIDENCY_LINE}
                          </p>
                        </>
                      )}
                    </div>

                    {!isLogin && (
                      <>
                        <div>
                          <Label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-1">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              id="confirm-password"
                              autoComplete="new-password"
                              className="w-full px-4 py-2 pr-11 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                              aria-pressed={showConfirmPassword}
                              className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword
                                ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                                : <Eye className="h-4 w-4" aria-hidden="true" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label htmlFor="terms" className="text-sm text-muted-foreground">
                            I agree to the{' '}
                            <Link to="/terms" className="text-primary hover:text-primary/80">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-primary hover:text-primary/80">
                              Privacy Policy
                            </Link>
                          </label>
                        </div>
                      </>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert>
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-md transition duration-200"
                      disabled={loading}
                    >
                      {loading
                        ? (isLogin ? 'Signing in...' : 'Creating Account...')
                        : (isLogin ? 'Sign In' : 'Create Account')
                      }
                    </Button>

                    {isLogin && (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => { setIsForgotPassword(true); setError(''); setSuccess(''); }}
                          className="text-sm text-primary hover:text-primary/80"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    )}
                  </div>
                </form>}

                <div className="mt-6 text-center">
                  {isRecovery ? null : isForgotPassword ? (
                    <p className="text-sm text-muted-foreground">
                      Remember it?{' '}
                      <button
                        onClick={() => { setIsForgotPassword(false); setError(''); setSuccess(''); }}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        Back to sign in
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isLogin ? "Don't have an account? " : 'Already have an account? '}
                      <button
                        onClick={switchMode}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        {isLogin ? 'Sign up' : 'Sign in'}
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}