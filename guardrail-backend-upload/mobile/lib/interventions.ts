import { Goal } from '../types/app';

export function buildInterventionMessage(goal: Goal | null, zoneLabel: string, amount = 40) {
  if (!goal) {
    return `You're entering ${zoneLabel}. Skip one impulse buy and keep your weekly budget intact.`;
  }

  const goalMap: Record<string, string> = {
    vacation: `Skipping this $${amount} purchase gets you closer to your vacation fund.`,
    debt: `Skipping this $${amount} purchase helps you clear debt faster.`,
    large_purchase: `Skipping this $${amount} purchase moves your big purchase goal forward.`
  };

  return `You're entering ${zoneLabel}. ${goalMap[goal.type]}`;
}

export function estimateSpendByCategory(category: string) {
  const estimates: Record<string, number> = {
    coffee: 8,
    big_box: 40,
    fast_food: 18
  };

  return estimates[category] ?? 20;
}
