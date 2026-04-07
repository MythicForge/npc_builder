import type { NpcResult } from '@/types/npc';
import type { BuildConfig } from '@/types/npc';
import type { ChassisData, DamageProfileEntry, BuildRules } from '@/types/data';

// Ordered damage steps used for step_modifier math
const DAMAGE_STEPS = [
  '1d4', '1d6', '1d8', '1d10', '1d12',
  '2d6', '2d8', '2d10', '2d12',
  '3d6', '3d8', '3d10', '4d6', '4d8', '4d10',
  '5d8', '5d10', '6d8', '6d10', '6d12', '7d10',
];

function stepDamage(base: string, steps: number): string {
  if (steps === 0) return base;
  const idx = DAMAGE_STEPS.indexOf(base);
  if (idx === -1) return base;
  const newIdx = Math.max(0, Math.min(DAMAGE_STEPS.length - 1, idx + steps));
  return DAMAGE_STEPS[newIdx];
}

/**
 * Step 3: Apply chassis combat math — vitality, armor, attack, damage step,
 * attribute modifiers, and caster dynamic spellcasting-attribute bonus.
 */
export function applyChassis(
  base: Partial<NpcResult> & { stats: NpcResult['stats'] },
  config: BuildConfig,
  chassisData: ChassisData[],
  damageProfiles: DamageProfileEntry[],
  buildRules: BuildRules
): typeof base {
  const chassis = chassisData.find((c) => c.id === config.chassis.toLowerCase());
  if (!chassis) return base;

  const profile = damageProfiles.find((d) => d.tier === config.tier);
  const baselineDamage = profile?.standard ?? base.stats.damagePrimary;

  const vitality = Math.round(base.stats.vitality * chassis.vitality_multiplier);
  const armor = base.stats.armor + chassis.defense_modifier;
  const attackBonusPrimary = base.stats.attackBonusPrimary + chassis.attack_modifier;
  const damagePrimary = stepDamage(baselineDamage, chassis.damage_step_modifier);

  // Attribute modifiers (flat shifts)
  let bodyMod = base.stats.bodyMod + (chassis.attribute_modifiers?.body ?? 0);
  let mindMod = base.stats.mindMod + (chassis.attribute_modifiers?.mind ?? 0);
  let willMod = base.stats.willMod + (chassis.attribute_modifiers?.will ?? 0);

  // Caster dynamic spellcasting-attribute bonus
  if (chassis.id === 'caster' && config.castingMode !== 'none') {
    const attr = config.castingAttribute ?? buildRules.caster_fallback_attribute ?? 'mind';
    const bonus = buildRules.caster_dynamic_stat_bonus ?? 2;
    if (attr === 'body') bodyMod += bonus;
    else if (attr === 'mind') mindMod += bonus;
    else if (attr === 'will') willMod += bonus;
  }

  return {
    ...base,
    chassis: chassis.name,
    stats: {
      ...base.stats,
      vitality,
      armor,
      attackBonusPrimary,
      damagePrimary,
      bodyMod,
      mindMod,
      willMod,
    },
  };
}
