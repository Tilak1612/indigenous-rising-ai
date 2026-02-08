import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'onboarding-v1';

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [territory, setTerritory] = useState('');
  const [businessStage, setBusinessStage] = useState('starting');
  const [industry, setIndustry] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setTerritory(parsed.territory || '');
        setBusinessStage(parsed.businessStage || 'starting');
        setIndustry(parsed.industry || '');
        setGoals(parsed.goals || []);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const data = { territory, businessStage, industry, goals };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [territory, businessStage, industry, goals]);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const toggleGoal = (g: string) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]));
  };

  const finish = () => {
    // For now we persist to localStorage and navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="w-full max-w-3xl">
        <Card className="p-8">
          <div className="mb-6">
            <div className="text-sm text-muted-foreground">Step {step} of 3</div>
            <div className="h-2 bg-muted/30 rounded-full mt-2 overflow-hidden">
              <div
                className="h-2 bg-primary"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold">Welcome — Tell us your territory</h2>
              <p className="text-sm text-muted-foreground">Selecting your territory helps us surface relevant funding and partners.</p>
              <Input placeholder="e.g., Anishinaabe Territory, Treaty 13" value={territory} onChange={(e) => setTerritory(e.target.value)} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold">Business stage & Industry</h2>
              <p className="text-sm text-muted-foreground">Help us understand where you are in your journey.</p>
              <Select value={businessStage} onValueChange={(v) => setBusinessStage(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Business Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starting">Starting</SelectItem>
                  <SelectItem value="growing">Growing</SelectItem>
                  <SelectItem value="scaling">Scaling</SelectItem>
                </SelectContent>
              </Select>

              <Input placeholder="Industry (e.g., Tourism, Tech)" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold">Primary goals</h2>
              <p className="text-sm text-muted-foreground">Select the top goals you'd like help with.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Funding', 'Training', 'Network', 'Business Plan', 'Impact Tracking'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={`px-4 py-2 rounded-lg border text-sm text-left ${goals.includes(g) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card/50 border-border/50 text-muted-foreground'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <div>
              {step > 1 && (
                <Button variant="ghost" onClick={back} className="mr-2">Back</Button>
              )}
            </div>

            <div>
              {step < 3 ? (
                <Button onClick={next}>Next</Button>
              ) : (
                <Button onClick={finish}>Finish & Go to Dashboard</Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingWizard;
