import { useState, useEffect } from 'react';
import { trackEvent } from '@/utils/analytics';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { RisingGlyph } from '@/components/RisingGlyph';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
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
  const [isLogin, setIsLogin] = useState(true);
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

      <section className="bg-background font-serif min-h-screen flex items-center justify-center px-4">
        <div className="container mx-auto">
          <div className="flex justify-center">
            <div className="w-full sm:w-10/12 md:w-8/12 lg:w-6/12 xl:w-4/12">
              {/* Brand header — keeps the auth page on-brand and gives a way back home */}
              <Link
                to="/"
                className="flex items-center justify-center gap-2.5 mb-6 group"
                aria-label="Indigenous Rising AI — home"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-primary text-primary-foreground transition-opacity group-hover:opacity-80">
                  <RisingGlyph size={21} />
                </span>
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
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      {!isLogin && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Password must be at least 8 characters long
                        </p>
                      )}
                    </div>

                    {!isLogin && (
                      <>
                        <div>
                          <Label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-1">
                            Confirm Password
                          </Label>
                          <Input
                            type="password"
                            id="confirm-password"
                            className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
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