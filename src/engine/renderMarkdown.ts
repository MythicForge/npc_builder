import type { NpcResult } from '@/types/npc';

function modStr(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function attrScore(mod: number): number {
  return 10 + mod; // score = 10 + mod (confirmed by sample NPCs: mod +4 → 14, mod 0 → 10)
}

/**
 * Step 9: Render the NpcResult into a formatted markdown string.
 * Produces plain markdown safe to paste directly into docs or codex files.
 */
export function renderMarkdown(npc: NpcResult): string {
  const lines: string[] = [];

  // Header
  const inhabitantStr = npc.inhabitants.join('/');
  const loreLine = `${npc.loreCategory}${npc.loreTags.length > 1 ? '/' + npc.loreTags.slice(1).join('/') : ''} (${npc.size})`;
  lines.push(`##### ${npc.name}`);
  lines.push(`*${inhabitantStr} (${npc.tier})* | **Lore** *${loreLine}*`);
  lines.push('');

  // Core stats
  lines.push(`**Vitality** ${npc.stats.vitality} **Armor** ${npc.stats.armor}`);
  lines.push(
    `**Body** ${modStr(npc.stats.bodyMod)} (**${attrScore(npc.stats.bodyMod)}**) | **Mind** ${modStr(npc.stats.mindMod)} (**${attrScore(npc.stats.mindMod)}**) | **Will** ${modStr(npc.stats.willMod)} (**${attrScore(npc.stats.willMod)}**) | **Move** ${npc.stats.move}`
  );
  lines.push('');

  // Attacks
  if (npc.attacks.length > 0) {
    npc.attacks.forEach((atk) => {
      const notePart = atk.notes ? ` *(${atk.notes})*` : '';
      lines.push(
        `**${atk.name}** ${modStr(atk.attackBonus)}, ${atk.damage} **${atk.damageType}**, ${atk.range}${notePart}`
      );
    });
    lines.push('');
  }

  // Passive traits
  if (npc.passiveTraits.length > 0) {
    npc.passiveTraits.forEach((t) => {
      lines.push(`*${t.name}* ${t.description}`);
    });
    lines.push('');
  }

  // Adversarial actions (respect adversarialActionBudget if set)
  if (npc.adversarialActions.length > 0) {
    const budget = npc.stats.adversarialActionBudget;
    const budgetLabel = budget !== undefined ? ` (Budget: ${budget})` : '';
    lines.push(`**Adversarial Actions**${budgetLabel}`);
    npc.adversarialActions.forEach((a) => {
      lines.push(`***${a.name}*** [${a.cost}] ${a.description}`);
    });
    lines.push('');
  }

  // Spellcasting
  if (npc.spells && npc.spells.spells.length > 0) {
    const attrLabel =
      npc.spells.attribute.charAt(0).toUpperCase() + npc.spells.attribute.slice(1);
    lines.push(`**Spellcasting** (*${attrLabel}*) | **DC** ${npc.spells.dc}`);

    const byRank: Record<number, string[]> = {};
    npc.spells.spells.forEach((s) => {
      if (!byRank[s.rank]) byRank[s.rank] = [];
      const usePart = s.uses != null ? ` (${s.uses})` : '';
      byRank[s.rank].push(`*${s.name}${usePart}*`);
    });

    Object.entries(byRank)
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([rank, names]) => {
        const label = Number(rank) === 0 ? 'Cantrip' : `T${rank}`;
        lines.push(`**${label}** ${names.join(', ')}`);
      });

    lines.push('');
  }

  // Horde state — surface damage bonus and targets clearly
  if (npc.hordeState) {
    const h = npc.hordeState;
    lines.push(`**Horde** [${h.currentSize}/${h.maxSize} units]`);
    lines.push(`**Unit Vitality** ${h.unitVitality} | **Targets/Strike** ${h.targetsPerStrike} | **Damage Bonus** ${h.damageBonus}`);
    if (h.vitalityBonusDicePerTier) {
      lines.push(`*Vitality bonus dice per tier: ${h.vitalityBonusDicePerTier}*`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
