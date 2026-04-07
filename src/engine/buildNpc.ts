/**
 * buildNpc.ts — Orchestrator
 * Runs the full NPC generation pipeline in the correct order and returns NpcResult.
 * All balance data is loaded from external JSON; no hardcoded values here.
 */

import type { BuildConfig, NpcResult } from '@/types/npc';
import type {
  TierData,
  ChassisData,
  InhabitantData,
  OverlayData,
  HordeData,
  DamageProfileEntry,
  BuildRules,
} from '@/types/data';

import { applyTier } from './applyTier';
import { applyInhabitant } from './applyInhabitant';
import { applyChassis } from './applyChassis';
import { applyCasting } from './applyCasting';
import { applyOverlay } from './applyOverlay';
import { applyHorde } from './applyHorde';
import { validateBuild } from './validateBuild';
import { renderMarkdown } from './renderMarkdown';

export interface DataBundle {
  tiers: TierData[];
  chassis: ChassisData[];
  inhabitants: InhabitantData[];
  overlays: OverlayData[];
  horde: HordeData;
  damageProfiles: DamageProfileEntry[];
  buildRules: BuildRules;
}

export interface NpcBuildResult {
  npc: NpcResult;
  markdown: string;
  warnings: NpcResult['warnings'];
}

export function buildNpc(config: BuildConfig, data: DataBundle): NpcBuildResult {
  // 1. Tier baseline
  const tierData = data.tiers.find((t) => t.tier === config.tier);
  if (!tierData) {
    throw new Error(`Tier ${config.tier} not found in tiers data.`);
  }

  let base = applyTier(tierData) as Partial<NpcResult> & { stats: NpcResult['stats'] };

  // Seed top-level fields from config
  base.name = config.name;
  base.tier = config.tier;
  base.size = config.size;
  base.castingMode = config.castingMode;
  base.traitOverlay = config.traitOverlay;
  base.attacks = config.customAttacks ?? [];
  base.passiveTraits = config.customTraits ?? [];
  base.adversarialActions = config.customAdversarialActions ?? [];

  // 2. Inhabitant identity + numeric combat effects
  base = applyInhabitant(base, config, data.inhabitants, data.buildRules);

  // 3. Chassis combat math (attribute modifiers, caster dynamic bonus)
  base = applyChassis(base, config, data.chassis, data.damageProfiles, data.buildRules);

  // 4. Casting package — spell DC resolved from final casting stat
  if (config.castingMode !== 'none') {
    base = applyCasting(base, config, data.buildRules);
  } else {
    base.castingMode = 'none';
    base.spells = undefined;
  }

  // 5. Trait overlay (damage step, AP, adversarial actions)
  base = applyOverlay(base, config, data.overlays);

  // 6. Horde rules
  if (config.traitOverlay === 'horde') {
    base = applyHorde(base, config, data.horde, data.buildRules);
  }

  // 7. Single-pass defense rounding — accumulate all raw defense mods, round once here
  if (base._rawDefenseMod !== undefined) {
    const roundMode = data.buildRules.final_defense_rounding_mode;
    const roundFn =
      roundMode === 'floor' ? Math.floor
      : roundMode === 'ceil' ? Math.ceil
      : Math.round; // 'round' and 'nearest_integer' both use Math.round
    base.stats = { ...base.stats, armor: base.stats.armor + roundFn(base._rawDefenseMod) };
    delete base._rawDefenseMod;
  }

  // 8. Enforce T2+ vitality floor
  if (config.tier >= 2 && base.stats.vitality < data.buildRules.tier_2_plus_standard_vitality_floor) {
    if (config.traitOverlay !== 'minion') {
      base.stats = { ...base.stats, vitality: data.buildRules.tier_2_plus_standard_vitality_floor };
    }
  }

  // 9. Validation
  const warnings = validateBuild(config, data.buildRules);

  // 9. Render markdown
  const npc = base as NpcResult;
  npc.warnings = warnings;
  npc.markdown = renderMarkdown(npc);

  return {
    npc,
    markdown: npc.markdown,
    warnings,
  };
}
