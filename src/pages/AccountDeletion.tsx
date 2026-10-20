import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import { ROUTE_TITLES } from '@/data/routeTitles';

/**
 * Public account-deletion page. Google Play's Data safety form requires a
 * public URL describing how to delete an account; Apple requires the in-app
 * path this page describes. Every statement here mirrors what the database
 * job in supabase/migrations/20261020000001_account_deletion_requests.sql
 * does — keep the two in step.
 */
const AccountDeletion = () => (
  <div className="min-h-screen bg-background">
    <MetaTags
      title={ROUTE_TITLES['/account-deletion']}
      description="How to delete your Indigenous Rising AI account from Settings or the app, what is deleted after the 30-day grace period, and what is kept for Canadian tax law."
      url="https://www.indigenousrising.ai/account-deletion"
    />
    <Navigation />
    <main className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs />

        <header className="mb-10">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">Delete your account</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            You can delete your Indigenous Rising AI account yourself, from the website or the app. Deletion
            happens 30 days after you ask, and you can change your mind at any point in those 30 days by
            signing in.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">How to delete your account</h2>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">On the website:</strong> sign in, open{' '}
              <Link to="/dashboard/settings" className="underline">Settings</Link>, go to the Account section
              and choose <em>Delete my account</em>. Type DELETE to confirm.
            </li>
            <li>
              <strong className="text-foreground">In the iOS or Android app:</strong> open the Account tab,
              choose <em>Delete your account</em> and confirm.
            </li>
            <li>
              <strong className="text-foreground">By email:</strong> if you can no longer sign in, write to{' '}
              <a href="mailto:help@indigenousrising.ai" className="underline">help@indigenousrising.ai</a>{' '}
              from the address on the account and we will schedule it for you.
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">The 30-day grace period</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your account keeps working for 30 days after the request, and Settings shows the exact deletion
            date. To cancel, sign in and choose <em>Cancel deletion</em> in Settings or in the app&apos;s
            Account tab. After the date passes, the deletion runs automatically and cannot be reversed.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">What is deleted</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground leading-relaxed">
            <li>Your sign-in identity, sessions and two-factor settings</li>
            <li>Your profile and business profile</li>
            <li>Business plans and their version history</li>
            <li>Uploaded documents</li>
            <li>Saved funding programmes, matches and application drafts</li>
            <li>Tasks, notifications, support tickets and assistant conversations</li>
            <li>Google Calendar connection, team invitations you sent, and preferences</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">What is kept, and why</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">Payment records</strong> for paid plans are kept by our payment
              processor and in our billing records for 7 years, as Canadian tax and business law requires.
            </li>
            <li>
              <strong className="text-foreground">Community posts and comments</strong> stay in the thread they
              belong to, with your name replaced by &ldquo;[account removed]&rdquo;, so other members&apos;
              conversations are not broken.
            </li>
            <li>
              <strong className="text-foreground">A security log entry</strong> records that an account was
              deleted and when, without your name or email.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Before you delete</h2>
          <p className="text-muted-foreground leading-relaxed">
            Export a copy of your data first from Settings (website) or the Account tab (app); the export
            includes your profile, business plans and saved funding. If you are on a paid plan, cancel it in
            Settings so you are not charged again. See also{' '}
            <Link to="/data-rights" className="underline">your data rights</Link> and the{' '}
            <Link to="/privacy" className="underline">privacy policy</Link>.
          </p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default AccountDeletion;
