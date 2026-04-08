'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { EncounterGroup, Difficulty } from '@/types/encounter';
import { computeEncounter } from '@/engine/encounterMath';

interface EncountersTabProps {
  tiers: number[];
}

const TIER_NUMBERS = Array.from({ length: 8 }, (_, i) => i); // 0-7

const difficultyColors: Record<Difficulty, string> = {
  None: 'text-muted-foreground',
  Trivial: 'text-blue-300',
  Easy: 'text-green-300',
  Medium: 'text-yellow-300',
  Hard: 'text-orange-300',
  Deadly: 'text-red-400',
};

export function EncountersTab() {
  const [partyTier, setPartyTier] = useState(0);
  const [playerCount, setPlayerCount] = useState(4);
  const [groups, setGroups] = useState<EncounterGroup[]>([]);

  const result = useMemo(
    () => computeEncounter(partyTier, playerCount, groups),
    [partyTier, playerCount, groups]
  );

  function addGroup() {
    const id = crypto.randomUUID();
    const newGroup: EncounterGroup = {
      id,
      name: 'Enemy Group',
      tier: partyTier,
      count: 1,
    };
    setGroups([...groups, newGroup]);
  }

  function updateGroup(id: string, partial: Partial<EncounterGroup>) {
    setGroups(
      groups.map((g) => (g.id === id ? { ...g, ...partial } : g))
    );
  }

  function removeGroup(id: string) {
    setGroups(groups.filter((g) => g.id !== id));
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel — inputs */}
      <div className="w-72 shrink-0 border-r border-border/30 bg-surface overflow-y-auto flex flex-col px-4 py-3 scrollbar-thin space-y-4">
        {/* Party Setup */}
        <div>
          <div className="flex items-center gap-2 py-1.5 border-b border-border/30 mb-2">
            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
            <span className="text-[11px] tracking-widest uppercase text-muted-foreground font-medium">
              Party Setup
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Party Tier</label>
              <div className="flex gap-1 flex-wrap">
                {TIER_NUMBERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPartyTier(t)}
                    className={cn(
                      'w-7 h-7 rounded-full border text-[11px] font-mono transition-all',
                      partyTier === t
                        ? 'bg-accent border-accent-bright text-background font-medium'
                        : 'bg-background border-border/50 text-muted-foreground hover:border-accent-bright hover:text-accent-bright'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Player Count</label>
              <input
                type="number"
                min={1}
                max={20}
                className="w-full bg-background border border-border/50 rounded px-2 py-1.5 text-[12px] text-foreground font-mono focus:outline-none focus:border-accent"
                value={playerCount}
                onChange={(e) => setPlayerCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </div>
          </div>
        </div>

        {/* Enemy Groups */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Enemy Groups
            </span>
            <button
              onClick={addGroup}
              className="text-[11px] text-accent hover:text-accent-bright border border-border/50 hover:border-accent rounded px-2 py-0.5 font-mono"
            >
              + Add
            </button>
          </div>

          {groups.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/50 italic">No enemies added.</p>
          ) : (
            <div className="space-y-2">
              {groups.map((group, idx) => (
                <div
                  key={group.id}
                  className="p-2 bg-surface/50 border border-border/30 rounded space-y-1.5"
                >
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-0.5">Name</label>
                    <input
                      className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-accent"
                      value={group.name}
                      onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                      placeholder="e.g. Goblin Archers"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-0.5">Tier</label>
                      <select
                        className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-accent appearance-none cursor-pointer"
                        value={group.tier}
                        onChange={(e) => updateGroup(group.id, { tier: parseInt(e.target.value, 10) })}
                      >
                        {TIER_NUMBERS.map((t) => (
                          <option key={t} value={t}>
                            T{t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-0.5">Count</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          min={1}
                          max={20}
                          className="flex-1 bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-accent"
                          value={group.count}
                          onChange={(e) => updateGroup(group.id, { count: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                        />
                        <button
                          onClick={() => removeGroup(group.id)}
                          className="text-[11px] text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-400 rounded px-1.5 font-mono"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — summary */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
        <div className="mb-4">
          <span className="text-[15px] font-medium text-accent font-mono tracking-wide">
            Encounter Summary
          </span>
        </div>

        {/* Difficulty */}
        <div className="mb-4">
          <div className="text-[12px] text-muted-foreground mb-1">Difficulty</div>
          <div className={cn('text-[24px] font-bold font-mono', difficultyColors[result.difficulty])}>
            {result.difficulty}
          </div>
          <p className="text-[12px] text-muted-foreground/80 mt-1">{result.notes}</p>
        </div>

        <div className="h-px bg-border/30 mb-4" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-surface border border-border/40 rounded p-2 text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Total ADP
            </div>
            <div className="text-[18px] font-medium font-mono text-accent">
              {result.totalAdp.toFixed(1)}
            </div>
          </div>

          <div className="bg-surface border border-border/40 rounded p-2 text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Total Enemies
            </div>
            <div className="text-[18px] font-medium font-mono text-foreground">
              {result.enemyCount}
            </div>
          </div>

          <div className="bg-surface border border-border/40 rounded p-2 text-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Party Size
            </div>
            <div className="text-[18px] font-medium font-mono text-teal">
              {playerCount}
            </div>
          </div>
        </div>

        {/* Enemy breakdown */}
        {result.groups.length > 0 && (
          <>
            <div className="h-px bg-border/30 mb-3" />
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              Enemy Groups
            </div>
            <div className="space-y-1.5">
              {result.groups.map((computed, idx) => {
                const group = groups.find((g) => g.id === computed.id);
                if (!group) return null;
                return (
                  <div key={computed.id} className="flex items-center justify-between text-[12px] font-mono">
                    <span className="text-foreground">{group.name}</span>
                    <span className="flex gap-3 text-muted-foreground">
                      <span>T{group.tier}</span>
                      <span>×{group.count}</span>
                      <span className="text-accent font-medium">{computed.adpTotal.toFixed(1)} ADP</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <>
            <div className="h-px bg-border/30 my-3" />
            <div className="space-y-1.5">
              {result.warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 px-2 py-1.5 bg-yellow-950/30 border border-yellow-900/40 rounded text-[11px] font-mono text-yellow-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0 mt-1" />
                  {warning}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
