import OnboardingWizard from '@/components/OnboardingWizard';
import MetaTags from '@/components/MetaTags';

const OnboardingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags title="Onboarding - Indigenous Rising AI" />
      <main>
        <div className="container mx-auto px-4 py-12">
          <OnboardingWizard />
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
