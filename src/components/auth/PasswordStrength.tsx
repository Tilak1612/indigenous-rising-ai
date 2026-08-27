import { scorePassword } from '@/lib/password-strength';

/** Live password strength feedback. Scoring lives in @/lib/password-strength. */
export const PasswordStrength = ({ value }: { value: string }) => {
  const { score, label, advice } = scorePassword(value);
  if (!value) return null;

  return (
    <div className="mt-2" data-testid="password-strength">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={
              'h-1 flex-1 rounded-full ' +
              (i <= score
                ? score <= 1 ? 'bg-destructive'
                  : score === 2 ? 'bg-warning'
                  : 'bg-success'
                : 'bg-muted')
            }
          />
        ))}
      </div>
      {/* A score of 0 has no label, and "Password strength: . Use at least 8
          characters" is what naive concatenation produced. Announced politely
          so a screen reader is not interrupted on every keystroke. */}
      <p className="mt-1 text-xs text-muted-foreground" role="status" aria-live="polite">
        {label
          ? 'Password strength: ' + label + (advice ? '. ' + advice : '')
          : advice}
      </p>
    </div>
  );
};

export default PasswordStrength;
