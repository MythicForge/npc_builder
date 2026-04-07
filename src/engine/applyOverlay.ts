import type { NpcResult } from '@/types/npc';
import type { BuildConfig } from '@/types/npc';
import type { OverlayData } from '@/types/data';

/**
 * Step 5: Apply trait overlay (Elite / Minion / None).
 * Horde routing is handled by applyHorde — this function passes horde through unchanged.
 * Applies vitality, armor, attack, damage step, action points, and adversarial action budget.
 */
export function applyOverlay(
  base: Partial<NpcResult> & { stats: NpcResult['stats'] },
  config: BuildConfig,
  overlays: OverlayData[]
): typeof base {
  const overlay = overlays.find((o) => o.id === config.traitOverlay);
  if (!overlay || overlay.id === 'none') {
    return { ...base, traitOverlay: 'none' };
  }
  // Horde overlay: mark name but defer all math to applyHorde
  if (overlay.id === 'horde') {
    return { ...base, traitOverlay: overlay.name };
  }

  const vitality = Math.round(base.stats.vitality * overlay.vitality_multiplier);
  const armor = base.stats.armor + overlay.defense_modifier;
  const attackBonusPrimary = base.stats.attackBonusPrimary + (overlay.attack_modifier ?? 0);

  // Damage step: accumulate into the scratch index
  const damageStepIndex = (base._damageStepIndex ?? 0) + (overlay.damage_step_modifier ?? 0);

  // Action points
  let actionPoints = base.stats.actionPoints;
  if (overlay.action_point_override !== undefined) {
    actionPoints = overlay.action_point_override;
  } else if (overlay.action_point_modifier !== undefined) {
    actionPoints = (actionPoints ?? 3) + overlay.action_point_modifier;
  }

  // Adversarial action budget
  let adversarialActionBudget = base.stats.adversarialActionBudget;
  if (overlay.adversarial_actions_override !== undefined) {
    adversarialActionBudget = overlay.adversarial_actions_override;
  } else if (overlay.adversarial_actions_bonus !== undefined) {
    adversarialActionBudget = (adversarialActionBudget ?? 0) + overlay.adversarial_actions_bonus;
  }

  return {
    ...base,
    traitOverlay: overlay.name,
    _damageStepIndex: damageStepIndex,
    stats: {
      ...base.stats,
      vitality,
      armor,
      attackBonusPrimary,
      actionPoints,
      adversarialActionBudget,
    },
  };
}
