import { rest } from './api';

// Same six sections, in the same order, as the web Business Planning
// Assistant (src/pages/dashboard/BusinessPlanner.tsx). Answers are stored in
// business_plans.content as { [sectionId]: text }, so a plan started on the
// web continues in the app and vice versa.
export const PLAN_SECTIONS = [
  { id: 'vision', title: 'Vision & Mission', description: 'Define your business purpose' },
  { id: 'market', title: 'Market Analysis', description: 'Understand your customers' },
  { id: 'products', title: 'Products/Services', description: 'What you offer' },
  { id: 'operations', title: 'Operations Plan', description: 'How you will operate' },
  { id: 'financial', title: 'Financial Projections', description: 'Revenue and costs' },
  { id: 'community', title: 'Community Impact', description: 'Indigenous-specific considerations' },
] as const;

export type PlanAnswers = Record<string, string>;

interface PlanRow {
  id: string;
  content: PlanAnswers | null;
  updated_at: string;
}

export async function loadPlan(userId: string): Promise<PlanRow | null> {
  const rows = await rest<PlanRow[]>(
    `business_plans?select=id,content,updated_at&user_id=eq.${userId}&order=updated_at.desc&limit=1`,
  );
  return rows[0] ?? null;
}

/** Find-or-create, exactly as the web does: PATCH the known row, else INSERT. */
export async function savePlan(
  userId: string,
  planId: string | null,
  answers: PlanAnswers,
): Promise<string> {
  if (planId) {
    await rest(`business_plans?id=eq.${planId}`, {
      method: 'PATCH',
      body: { content: answers, updated_at: new Date().toISOString() },
    });
    return planId;
  }
  const rows = await rest<{ id: string }[]>('business_plans', {
    method: 'POST',
    prefer: 'return=representation',
    // plan_type and status must satisfy the table's CHECK constraints.
    body: { user_id: userId, title: 'My Business Plan', plan_type: 'startup', status: 'draft', content: answers },
  });
  return rows[0].id;
}
