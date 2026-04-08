import type { EncounterGroup, EncounterResult, Difficulty } from '@/types/encounter';

/**
 * Calculate relative tier difference.
 * Positive = enemy is stronger, negative = enemy is weaker
 */
export function getRelativeTier(enemyTier: number, partyTier: number): number {
  return enemyTier - partyTier;
}

/**
 * Get ADP multiplier from relative tier.
 * ADP = Adversarial Difficulty Points
 */
export function getAdpFromRelativeTier(delta: number): number {
  if (delta <= -2) return 0.5;
  if (delta === -1) return 1;
  if (delta === 0) return 2;
  if (delta === 1) return 4;
  if (delta === 2) return 8;
  return 12; // delta >= 3
}

/**
 * Calculate total encounter ADP.
 */
export function getEncounterTotalAdp(
  partyTier: number,
  groups: EncounterGroup[]
): number {
  if (groups.length === 0) return 0;

  return groups.reduce((total, group) => {
    const delta = getRelativeTier(group.tier, partyTier);
    const adpEach = getAdpFromRelativeTier(delta);
    return total + adpEach * group.count;
  }, 0);
}

/**
 * Resolve difficulty label from total ADP and player count.
 */
export function getEncounterDifficultyLabel(
  totalAdp: number,
  playerCount: number
): Difficulty {
  if (totalAdp <= 0) return 'None';

  const trivial = playerCount * 1.5;
  const easy = playerCount * 3;
  const medium = playerCount * 4;
  const hard = playerCount * 5;

  if (totalAdp < trivial) return 'Trivial';
  if (totalAdp < easy) return 'Easy';
  if (totalAdp < medium) return 'Medium';
  if (totalAdp < hard) return 'Hard';
  return 'Deadly';
}

/**
 * Get notes for the current difficulty.
 */
export function getDifficultyNotes(difficulty: Difficulty): string {
  const notes: Record<Difficulty, string> = {
    None: 'No enemies added.',
    Trivial: 'Very low threat.',
    Easy: 'Light pressure.',
    Medium: 'Standard encounter.',
    Hard: 'High pressure.',
    Deadly: 'Severe threat.',
  };
  return notes[difficulty];
}

/**
 * Generate warnings for the encounter.
 */
export function getEncounterWarnings(
  partyTier: number,
  playerCount: number,
  groups: EncounterGroup[]
): string[] {
  const warnings: string[] = [];

  // No enemies
  if (groups.length === 0) {
    warnings.push('No enemies added.');
    return warnings;
  }

  // High enemy count
  const totalEnemies = groups.reduce((sum, g) => sum + g.count, 0);
  if (totalEnemies > 8) {
    warnings.push(`High enemy count (${totalEnemies} total). May be overwhelming.`);
  }

  // Weak solo
  if (totalEnemies === 1) {
    const group = groups[0];
    const delta = getRelativeTier(group.tier, partyTier);
    const adp = getAdpFromRelativeTier(delta);
    if (adp * 1 < playerCount * 2) {
      warnings.push('Solo enemy is very weak. May trivialize encounter.');
    }
  }

  // Tier spike
  for (const group of groups) {
    if (group.tier >= partyTier + 3) {
      warnings.push(`Tier spike: enemy at T${group.tier} vs party T${partyTier}.`);
      break;
    }
  }

  return warnings;
}

/**
 * Compute the full encounter result.
 */
export function computeEncounter(
  partyTier: number,
  playerCount: number,
  groups: EncounterGroup[]
): EncounterResult {
  const totalAdp = getEncounterTotalAdp(partyTier, groups);
  const enemyCount = groups.reduce((sum, g) => sum + g.count, 0);
  const difficulty = getEncounterDifficultyLabel(totalAdp, playerCount);
  const notes = getDifficultyNotes(difficulty);
  const warnings = getEncounterWarnings(partyTier, playerCount, groups);

  const computedGroups = groups.map((g) => {
    const delta = getRelativeTier(g.tier, partyTier);
    const adpEach = getAdpFromRelativeTier(delta);
    return {
      id: g.id,
      relativeTier: delta,
      adpEach,
      adpTotal: adpEach * g.count,
    };
  });

  return {
    totalAdp,
    enemyCount,
    difficulty,
    notes,
    warnings,
    groups: computedGroups,
  };
}
