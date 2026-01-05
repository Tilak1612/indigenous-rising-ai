import React from 'react';
import JourneyCard from '@/components/JourneyCard';
import { useAuth } from '@/hooks/useAuth';
import { getString } from '@/lib/i18n';

const LANG_KEY = 'preferred-language';
const QUIZ_KEY = 'quiz-choice';

const mapQuizToJourney = (quizChoice: string | null) => {
  switch (quizChoice) {
    case 'starting':
    case 'features':
      return { stage: 'Starting', actions: ['Create funding profile', 'Start business plan', 'Enroll in Fundamentals'], progress: 10 };
    case 'growing':
    case 'training':
      return { stage: 'Growing', actions: ['Optimize operations', 'Apply for growth fund', 'Join mentorship'], progress: 45 };
    case 'funding':
    case 'funding':
      return { stage: 'Starting', actions: ['Complete funding profile', 'Match to programs', 'Start application'], progress: 20 };
    default:
      return { stage: 'Starting', actions: ['Create funding profile', 'Start business plan', 'Enroll in Fundamentals'], progress: 28 };
  }
};

const SnapshotTile = ({ title, value }: { title: string; value: string | number }) => (
  <div className="bg-white/5 p-4 rounded-lg border border-white/6">
    <p className="text-sm text-white/70">{title}</p>
    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const preferredLang = (user?.preferredLanguage) || (() => { try { return localStorage.getItem(LANG_KEY) || 'en'; } catch { return 'en'; } })();
  const quizChoice = (() => { try { return localStorage.getItem(QUIZ_KEY); } catch { return null; } })();
  const journey = mapQuizToJourney(quizChoice);

  return (
    <main className="min-h-screen bg-neutral-900 text-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Cultural Layer */}
        <section className="mb-6">
          <div className="rounded-lg bg-white/3 p-4">
            <p className="text-sm text-white/80">{getString(preferredLang, 'territory_ack')}</p>
            <p className="mt-1 text-lg font-medium">{getString(preferredLang, 'greeting')}</p>
            <blockquote className="mt-2 text-sm text-white/70 italic">“Rotating Elder quote placeholder.”</blockquote>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <JourneyCard
              stage={journey.stage}
              topActions={journey.actions}
              progress={journey.progress}
            />

            <section className="bg-white/3 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Activity feed</h3>
              <p className="text-sm text-white/70 mt-2">No recent activity — get started with your top actions.</p>
            </section>
          </div>

          <aside className="space-y-4">
            <SnapshotTile title="Funding matches" value={3} />
            <SnapshotTile title="Applications in progress" value={1} />
            <SnapshotTile title="Impact score" value={'72%'} />
            <SnapshotTile title="Active trainings" value={2} />
            <SnapshotTile title="Upcoming events" value={0} />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
