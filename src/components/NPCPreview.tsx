'use client';

import type { NpcResult } from '@/types/npc';
import { cn } from '@/lib/utils';

interface NPCPreviewProps {
  npc: NpcResult | null;
}

function modStr(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function attrScore(mod: number): number {
  return 10 + mod; // score = 10 + mod (mod +4 → 14, mod 0 → 10)
}

export function NPCPreview({ npc }: NPCPreviewProps) {
  if (!npc) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-[12px] font-mono">
        Fill in the form to generate a stat block.
      </div>
    );
  }

  const errors = npc.warnings.filter((w) => w.severity === 'error');
  const advisories = npc.warnings.filter((w) => w.severity === 'warning');

  return (
    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
      {/* Name */}
      <div className="mb-1">
        <span className="text-[15px] font-medium text-accent font-mono tracking-wide">
          {npc.name || 'Unnamed NPC'}
        </span>
      </div>

      {/* Identity line */}
      <div className="text-[12px] text-muted-foreground font-mono mb-3">
        <span className="italic">{npc.inhabitants.join('/')}</span>
        {' '}
        <span className="text-foreground/60">({npc.tier})</span>
        {' | '}
        <span className="font-medium text-foreground/80">Lore</span>
        {' '}
        <span className="italic">{npc.loreCategory}{npc.loreTags.length > 1 ? '/' + npc.loreTags.slice(1).join('/') : ''} ({npc.size})</span>
      </div>

      {/* Divider */}
      <div className="h-px mb-3" style={{ background: 'linear-gradient(90deg, var(--color-orange) 0%, transparent 100%)' }} />

      {/* Primary stats grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <StatCard label="Vitality" value={npc.stats.vitality} colorClass="text-red-400" />
        <StatCard label="Armor" value={npc.stats.armor} colorClass="text-blue-300" />
        <StatCard label="Attack" value={`+${npc.stats.attackBonusPrimary}`} colorClass="text-accent" />
        <StatCard label="Move" value={npc.stats.move} colorClass="text-teal" />
      </div>

      {/* Attribute line */}
      <div className="flex gap-4 flex-wrap mb-4 text-[12px] font-mono">
        <span>
          <span className="text-muted-foreground">Body </span>
          <span className="text-foreground font-medium">{modStr(npc.stats.bodyMod)}</span>
          <span className="text-muted-foreground text-[11px]"> ({attrScore(npc.stats.bodyMod)})</span>
        </span>
        <span>
          <span className="text-muted-foreground">Mind </span>
          <span className="text-foreground font-medium">{modStr(npc.stats.mindMod)}</span>
          <span className="text-muted-foreground text-[11px]"> ({attrScore(npc.stats.mindMod)})</span>
        </span>
        <span>
          <span className="text-muted-foreground">Will </span>
          <span className="text-foreground font-medium">{modStr(npc.stats.willMod)}</span>
          <span className="text-muted-foreground text-[11px]"> ({attrScore(npc.stats.willMod)})</span>
        </span>
      </div>

      {/* Role tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <Tag label={npc.chassis} color="blue" />
        <Tag label={npc.traitOverlay !== 'none' ? npc.traitOverlay : 'Standard'} color={
          npc.traitOverlay === 'Elite' ? 'yellow'
            : npc.traitOverlay === 'Minion' ? 'teal'
            : npc.traitOverlay === 'Horde' ? 'orange'
            : 'neutral'
        } />
        {npc.castingMode !== 'none' && (
          <Tag label={`${npc.castingMode} Caster`} color="teal" />
        )}
      </div>

      <div className="h-px bg-border/30 mb-3" />

      {/* Attacks */}
      {npc.attacks.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Attacks</SectionLabel>
          {npc.attacks.map((atk) => (
            <div key={atk.id} className="flex flex-wrap items-baseline gap-2 text-[12px] font-mono mb-1.5">
              <span className="text-accent font-medium">{atk.name}</span>
              <span className="text-green-300">{modStr(atk.attackBonus)}</span>
              <span className="text-foreground">{atk.damage}</span>
              <span className="text-muted-foreground text-[11px]">
                {atk.damageType} · {atk.range}
              </span>
              {atk.notes && (
                <span className="text-muted-foreground/70 text-[11px] italic">{atk.notes}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Passive Traits */}
      {npc.passiveTraits.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Passive Traits</SectionLabel>
          {npc.passiveTraits.map((t) => (
            <div key={t.id} className="text-[12px] font-mono mb-1.5 leading-relaxed">
              <span className="text-teal italic">{t.name} </span>
              <span className="text-foreground/80">{t.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Adversarial Actions */}
      {npc.adversarialActions.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Adversarial Actions</SectionLabel>
          {npc.adversarialActions.map((a) => (
            <div key={a.id} className="text-[12px] font-mono mb-1.5 leading-relaxed">
              <span className="text-purple-300 font-medium italic">{a.name} </span>
              <span className="inline-block bg-purple-900/30 text-purple-300 rounded px-1 text-[10px] mr-1">
                [{a.cost}]
              </span>
              <span className="text-foreground/80">{a.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Spellcasting */}
      {npc.spells && npc.spells.spells.length > 0 && (
        <div className="mb-4">
          <SectionLabel>Spellcasting</SectionLabel>
          <div className="text-[12px] font-mono mb-1.5">
            <span className="text-teal">
              {npc.spells.attribute.charAt(0).toUpperCase() + npc.spells.attribute.slice(1)}
            </span>
            <span className="text-muted-foreground"> | DC </span>
            <span className="text-foreground">{npc.spells.dc}</span>
          </div>
          {Object.entries(
            npc.spells.spells.reduce<Record<number, typeof npc.spells.spells>>((acc, s) => {
              acc[s.rank] = acc[s.rank] ?? [];
              acc[s.rank].push(s);
              return acc;
            }, {})
          )
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([rank, spells]) => (
              <div key={rank} className="text-[12px] font-mono mb-1">
                <span className="text-blue-300 font-medium">
                  {Number(rank) === 0 ? 'Cantrip' : `T${rank}`}{' '}
                </span>
                <span className="text-foreground/80">
                  {spells.map((s) => `${s.name}${s.uses != null ? ` (${s.uses})` : ''}`).join(', ')}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Horde state */}
      {npc.hordeState && (
        <div className="mb-4 p-2 bg-orange-900/10 border border-orange-900/30 rounded">
          <SectionLabel>Horde State</SectionLabel>
          <div className="grid grid-cols-2 gap-y-1 text-[12px] font-mono">
            <div>
              <span className="text-muted-foreground">Size: </span>
              <span className="text-orange-300">
                {npc.hordeState.currentSize}/{npc.hordeState.maxSize}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Targets/Strike: </span>
              <span className="text-orange-300">{npc.hordeState.targetsPerStrike}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Dmg Bonus: </span>
              <span className="text-orange-300">{npc.hordeState.damageBonus}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Unit VP: </span>
              <span className="text-orange-300">{npc.hordeState.unitVitality}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lore DC */}
      <div className="text-[11px] text-muted-foreground font-mono">
        Lore DC {npc.loreIdentifyDC} ({npc.loreCategory})
      </div>

      {/* Warnings */}
      {(errors.length > 0 || advisories.length > 0) && (
        <div className="mt-4 space-y-1.5">
          {errors.map((w) => (
            <div
              key={w.code}
              className="flex items-start gap-2 px-2 py-1.5 bg-red-950/30 border border-red-900/40 rounded text-[11px] font-mono text-red-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1" />
              {w.message}
            </div>
          ))}
          {advisories.map((w) => (
            <div
              key={w.code}
              className="flex items-start gap-2 px-2 py-1.5 bg-yellow-950/30 border border-yellow-900/40 rounded text-[11px] font-mono text-yellow-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0 mt-1" />
              {w.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number | string;
  colorClass: string;
}) {
  return (
    <div className="bg-surface border border-border/40 rounded p-2 text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className={cn('text-[18px] font-medium font-mono', colorClass)}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wider text-orange-400 mb-2">{children}</div>
  );
}

type TagColor = 'blue' | 'yellow' | 'teal' | 'orange' | 'neutral';

function Tag({ label, color }: { label: string; color: TagColor }) {
  const colorMap: Record<TagColor, string> = {
    blue: 'bg-blue-900/20 border-blue-800 text-blue-300',
    yellow: 'bg-yellow-900/20 border-yellow-800 text-yellow-300',
    teal: 'bg-teal/10 border-teal/40 text-teal',
    orange: 'bg-orange-900/20 border-orange-800 text-orange-300',
    neutral: 'bg-surface border-border/50 text-muted-foreground',
  };
  return (
    <span
      className={cn(
        'text-[11px] font-mono border rounded px-2 py-0.5',
        colorMap[color]
      )}
    >
      {label}
    </span>
  );
}
