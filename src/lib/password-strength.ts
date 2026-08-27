/**
 * Password strength scoring, kept out of the component file so that file
 * only exports a component (react-refresh/only-export-components).
 *
 * Deliberately not a score out of 100: an invented number is the same
 * mistake as an invented statistic. Each point corresponds to a property
 * the password either has or does not, and the advice names the next thing
 * that would improve it. The 8-character minimum is enforced by the signup
 * schema — this only describes, it never gates.
 */
export type StrengthResult = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  advice: string | null;
};

export const scorePassword = (value: string): StrengthResult => {
  if (!value) return { score: 0, label: '', advice: null };

  const longEnough = value.length >= 8;
  const roomy = value.length >= 12;
  const mixedCase = /[a-z]/.test(value) && /[A-Z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);

  const met = [longEnough, mixedCase, hasDigit, hasSymbol].filter(Boolean).length;
  const score = (roomy && met >= 3 ? 4 : met) as StrengthResult['score'];

  const advice = !longEnough ? 'Use at least 8 characters'
    : !mixedCase ? 'Mix upper and lower case'
    : !hasDigit ? 'Add a number'
    : !hasSymbol ? 'Add a symbol'
    : !roomy ? 'Longer is stronger — 12 characters or more'
    : null;

  return { score, label: ['', 'Weak', 'Fair', 'Good', 'Strong'][score] ?? '', advice };
};
