import type { NpcResult, HordeState } from '@/types/npc';
import type { BuildConfig } from '@/types/npc';
import type { HordeData, BuildRules } from '@/types/data';

/**
 * Step 6: Apply horde size scaling (called only when traitOverlay === 'horde').
 * Defense does NOT change per horde_defense_scales: false.
 * Summoned hordes receive AP from buildRules.summoned_horde_default_action_points.
 */
export function applyHorde(
  base: Partial<NpcResult> & { stats: NpcResult['stats'] },
  config: BuildConfig,
  hordeData: HordeData,
  buildRules: BuildRules
): typeof base {
  if (config.traitOverlay !== 'horde') return base;

  const size = config.hordeSize ?? 1;
  const entry = hordeData.size_table.find(
    (row) => size >= row.size_min && (row.size_max === null || size <= row.size_max)
  ) ?? hordeData.size_table[0];

  // Vitality bonus: "XdY" — use average per tier
  let vitalityBonus = 0;
  if (entry.vitality_bonus_dice_per_tier) {
    const match = entry.vitality_bonus_dice_per_tier.match(/(\d+)d(\d+)/);
    if (match) {
      const count = parseInt(match[1], 10);
      const sides = parseInt(match[2], 10);
      const avgPerDie = (sides + 1) / 2;
      vitalityBonus = Math.round(count * avgPerDie * config.tier);
    }
  }

  const totalVitality = base.stats.vitality + vitalityBonus;
  // Unit vitality is deterministic: total / size
  const unitVitality = Math.round(totalVitality / Math.max(1, size));

  // Summoned horde action points from buildRules
  const isSummoned = !!(config as BuildConfig & { isSummonedHorde?: boolean }).isSummonedHorde;
  const actionPoints = isSummoned
    ? (buildRules.summoned_horde_default_action_points ?? 2)
    : base.stats.actionPoints;

  const hordeState: HordeState = {
    currentSize: size,
    maxSize: size,
    targetsPerStrike: entry.targets_per_strike,
    damageBonus: entry.damage_bonus,
    vitalityBonusDicePerTier: entry.vitality_bonus_dice_per_tier,
    unitVitality,
  };

  return {
    ...base,
    stats: {
      ...base.stats,
      vitality: totalVitality,
      // Defense intentionally unchanged: horde_defense_scales = false
      actionPoints,
    },
    hordeState,
  };
}
