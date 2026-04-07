import type { NpcResult, NpcStats } from '@/types/npc';
import type { TierData } from '@/types/data';

/**
 * Step 1: Load tier baseline stats and return the initial NpcResult skeleton.
 * All values use the tier's recommended (midpoint) values.
 */
export function applyTier(tierData: TierData): Partial<NpcResult> & { stats: NpcStats } {
  const primaryMod = tierData.recommended_primary_mod;
  const loreDC = tierData.lore_dc;

  return {
    tier: tierData.tier,
    loreIdentifyDC: loreDC,
    stats: {
      vitality: tierData.recommended_vitality,
      armor: tierData.recommended_defense,
      move: 1,
      bodyMod: primaryMod,
      mindMod: Math.max(0, primaryMod - 3),
      willMod: Math.max(0, primaryMod - 2),
      attackBonusPrimary: tierData.recommended_attack_bonus,
      damagePrimary: tierData.damage_profile.standard,
    },
  };
}
