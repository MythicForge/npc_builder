import type { NpcResult, SpellSection } from '@/types/npc';
import type { BuildConfig } from '@/types/npc';
import type { BuildRules } from '@/types/data';

/**
 * Step 4: Apply casting package if castingMode !== 'none'.
 * Spell DC = 10 + relevantStatMod (resolved after inhabitant + chassis modifiers).
 * Casting attribute falls back to buildRules.caster_fallback_attribute if not specified.
 */
export function applyCasting(
  base: Partial<NpcResult> & { stats: NpcResult['stats'] },
  config: BuildConfig,
  buildRules: BuildRules
): typeof base {
  if (config.castingMode === 'none') {
    return { ...base, castingMode: 'none' };
  }

  const attr = config.castingAttribute ?? buildRules.caster_fallback_attribute ?? 'mind';

  // Resolve the current modifier for the chosen attribute from the already-updated stats
  let relevantMod = 0;
  if (attr === 'body') relevantMod = base.stats.bodyMod;
  else if (attr === 'mind') relevantMod = base.stats.mindMod;
  else if (attr === 'will') relevantMod = base.stats.willMod;

  const spells: SpellSection = {
    attribute: attr,
    dc: 10 + relevantMod,
    spells: config.spells ?? [],
  };

  return {
    ...base,
    castingMode: config.castingMode,
    castingAttribute: attr,
    spells,
  };
}
