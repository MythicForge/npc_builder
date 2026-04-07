'use client';

import { useState } from 'react';
import type { NpcResult } from '@/types/npc';

interface JsonOutputProps {
  npc: NpcResult | null;
}

function buildExportJson(npc: NpcResult) {
  return {
    name: npc.name,
    tier: npc.tier,
    size: npc.size,
    inhabitants: npc.inhabitants,
    chassis: npc.chassis,
    trait_overlay: npc.traitOverlay,
    casting_mode: npc.castingMode,
    spellcasting_attribute: npc.castingAttribute ?? null,
    stats: {
      vitality: npc.stats.vitality,
      armor: npc.stats.armor,
      move: npc.stats.move,
      body_mod: npc.stats.bodyMod,
      mind_mod: npc.stats.mindMod,
      will_mod: npc.stats.willMod,
      attack_bonus_primary: npc.stats.attackBonusPrimary,
      damage_primary: npc.stats.damagePrimary,
      action_points: npc.stats.actionPoints ?? null,
      adversarial_action_budget: npc.stats.adversarialActionBudget ?? null,
    },
    lore_tags: npc.loreTags,
    lore_category: npc.loreCategory,
    lore_identify_dc: npc.loreIdentifyDC,
    attacks: npc.attacks,
    passive_traits: npc.passiveTraits,
    adversarial_actions: npc.adversarialActions,
    spells: npc.spells ?? null,
    horde_state: npc.hordeState ?? null,
    markdown: npc.markdown,
  };
}

export function JsonOutput({ npc }: JsonOutputProps) {
  const [copied, setCopied] = useState(false);

  const hasErrors = (npc?.warnings ?? []).some((w) => w.severity === 'error');
  const json = npc && !hasErrors
    ? JSON.stringify(buildExportJson(npc), null, 2)
    : '// Resolve all errors before exporting JSON.';

  function handleCopy() {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleDownload() {
    if (!npc || hasErrors) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${npc.name?.replace(/\s+/g, '_') ?? 'npc'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-surface">
        <span className="text-[11px] uppercase tracking-widest text-teal">JSON Export</span>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={hasErrors}
            className="text-[11px] font-mono border border-border/50 bg-surface-2 hover:border-accent hover:text-accent text-muted-foreground rounded px-2.5 py-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button
            onClick={handleDownload}
            disabled={hasErrors}
            className="text-[11px] font-mono border border-accent/60 bg-accent/10 hover:bg-accent/20 text-accent rounded px-2.5 py-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Download .json
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <pre className="text-[11.5px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {json}
        </pre>
      </div>
    </div>
  );
}
