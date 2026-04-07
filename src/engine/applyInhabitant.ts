import type { NpcResult } from '@/types/npc';
import type { BuildConfig } from '@/types/npc';
import type { InhabitantData } from '@/types/data';
import type { BuildRules } from '@/types/data';

/**
 * Step 2: Apply inhabitant type — numeric vitality/defense effects + lore + attribute lean.
 * Primary inhabitant uses weight 1.0; secondary uses buildRules.secondary_inhabitant_numeric_weight.
 * Defense modifier is accumulated as a raw float (_rawDefenseMod) and rounded once in buildNpc.
 */
export function applyInhabitant(
  base: Partial<NpcResult> & { stats: NpcResult['stats'] },
  config: BuildConfig,
  inhabitants: InhabitantData[],
  buildRules: BuildRules
): typeof base {
  const primary = inhabitants.find((i) => i.id === config.inhabitantPrimary.toLowerCase());
  const secondary = config.inhabitantSecondary
    ? inhabitants.find((i) => i.id === config.inhabitantSecondary!.toLowerCase())
    : undefined;

  const secWeight = secondary ? (buildRules.secondary_inhabitant_numeric_weight ?? 0.5) : 0;

  // ── Vitality multiplier: 1 + sum((mult - 1) * weight) ──────────────────────
  const vitMultiplier =
    1 +
    ((primary?.vitality_multiplier ?? 1) - 1) * 1.0 +
    (secondary ? ((secondary.vitality_multiplier ?? 1) - 1) * secWeight : 0);

  // ── Defense modifier: sum raw floats — round later in buildNpc ──────────────
  const rawDefMod =
    (primary?.defense_modifier ?? 0) * 1.0 +
    (secondary ? (secondary.defense_modifier ?? 0) * secWeight : 0);

  // ── Attribute lean: weighted sum, rounded ──────────────────────────────────
  const primaryLean = primary?.attribute_lean ?? { body: 0, mind: 0, will: 0 };
  const secondaryLean = secondary?.attribute_lean ?? { body: 0, mind: 0, will: 0 };

  const bodyLean = primaryLean.body * 1.0 + secondaryLean.body * secWeight;
  const mindLean = primaryLean.mind * 1.0 + secondaryLean.mind * secWeight;
  const willLean = primaryLean.will * 1.0 + secondaryLean.will * secWeight;

  // ── Lore tags ──────────────────────────────────────────────────────────────
  const loreTags: string[] = primary ? [...primary.default_lore] : [];
  if (secondary) {
    secondary.default_lore.forEach((t) => {
      if (!loreTags.includes(t)) loreTags.push(t);
    });
  }
  const loreCategory = loreTags[0] ?? 'Unknown';

  const inhabitantList = [
    primary?.name ?? config.inhabitantPrimary,
    ...(secondary ? [secondary.name] : []),
  ];

  const stats = {
    ...base.stats,
    vitality: Math.round(base.stats.vitality * vitMultiplier),
    bodyMod: base.stats.bodyMod + Math.round(bodyLean),
    mindMod: base.stats.mindMod + Math.round(mindLean),
    willMod: base.stats.willMod + Math.round(willLean),
  };

  return {
    ...base,
    inhabitants: inhabitantList,
    loreTags,
    loreCategory,
    stats,
    _rawDefenseMod: (base._rawDefenseMod ?? 0) + rawDefMod,
  };
}
