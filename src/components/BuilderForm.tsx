'use client';

import { cn } from '@/lib/utils';
import type { BuildConfig, Attack, Trait, AdversarialAction, SpellEntry } from '@/types/npc';
import type { TierData, ChassisData, InhabitantData, OverlayData, SizeData } from '@/types/data';
import { useState } from 'react';

interface BuilderFormProps {
  config: BuildConfig;
  onChange: (config: BuildConfig) => void;
  tiers: TierData[];
  chassis: ChassisData[];
  inhabitants: InhabitantData[];
  overlays: OverlayData[];
  sizes: SizeData[];
}

function SectionHead({
  color,
  label,
  open,
  onToggle,
}: {
  color: string;
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full py-1.5 border-b border-border/30 mb-2 text-left"
    >
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', color)} />
      <span className="text-[11px] tracking-widest uppercase text-muted-foreground font-medium">
        {label}
      </span>
      <span className="ml-auto text-[10px] text-muted-foreground">{open ? '▲' : '▼'}</span>
    </button>
  );
}

export function BuilderForm({
  config,
  onChange,
  tiers,
  chassis,
  inhabitants,
  overlays,
  sizes,
}: BuilderFormProps) {
  const [openSections, setOpenSections] = useState({
    identity: true,
    type: true,
    role: true,
    horde: true,
    casting: true,
    loadout: true,
    notes: false,
  });

  function toggle(key: keyof typeof openSections) {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  }

  function update(partial: Partial<BuildConfig>) {
    onChange({ ...config, ...partial });
  }

  // Tier numbers available
  const tierNumbers = tiers.map((t) => t.tier).sort((a, b) => a - b);

  const overlayData = overlays.find((o) => o.id === config.traitOverlay) ?? overlays[0];

  // Attack management
  function addAttack() {
    const id = crypto.randomUUID();
    const newAttack: Attack = {
      id,
      name: 'New Attack',
      attackBonus: config.tier + 2,
      damage: '1d8',
      damageType: 'Slash',
      range: 'Melee',
      notes: '',
    };
    update({ customAttacks: [...(config.customAttacks ?? []), newAttack] });
  }

  function updateAttack(idx: number, partial: Partial<Attack>) {
    const attacks = [...(config.customAttacks ?? [])];
    attacks[idx] = { ...attacks[idx], ...partial };
    update({ customAttacks: attacks });
  }

  function removeAttack(idx: number) {
    const attacks = [...(config.customAttacks ?? [])];
    attacks.splice(idx, 1);
    update({ customAttacks: attacks });
  }

  // Trait management
  function addTrait() {
    const newTrait: Trait = { id: crypto.randomUUID(), name: 'New Trait', description: '' };
    update({ customTraits: [...(config.customTraits ?? []), newTrait] });
  }

  function updateTrait(idx: number, partial: Partial<Trait>) {
    const traits = [...(config.customTraits ?? [])];
    traits[idx] = { ...traits[idx], ...partial };
    update({ customTraits: traits });
  }

  function removeTrait(idx: number) {
    const traits = [...(config.customTraits ?? [])];
    traits.splice(idx, 1);
    update({ customTraits: traits });
  }

  // Adversarial Action management
  function addAdversarialAction() {
    const newAction: AdversarialAction = {
      id: crypto.randomUUID(),
      name: 'New Action',
      cost: 2,
      description: '',
    };
    update({ customAdversarialActions: [...(config.customAdversarialActions ?? []), newAction] });
  }

  function updateAction(idx: number, partial: Partial<AdversarialAction>) {
    const actions = [...(config.customAdversarialActions ?? [])];
    actions[idx] = { ...actions[idx], ...partial };
    update({ customAdversarialActions: actions });
  }

  function removeAction(idx: number) {
    const actions = [...(config.customAdversarialActions ?? [])];
    actions.splice(idx, 1);
    update({ customAdversarialActions: actions });
  }

  // Spell management
  function addSpell() {
    const newSpell: SpellEntry = { id: crypto.randomUUID(), rank: 1, name: '' };
    update({ spells: [...(config.spells ?? []), newSpell] });
  }

  function updateSpell(idx: number, partial: Partial<SpellEntry>) {
    const spells = [...(config.spells ?? [])];
    spells[idx] = { ...spells[idx], ...partial };
    update({ spells });
  }

  function removeSpell(idx: number) {
    const spells = [...(config.spells ?? [])];
    spells.splice(idx, 1);
    update({ spells });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-surface">
        <span className="text-[11px] tracking-widest uppercase text-accent font-medium">
          NPC Configuration
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scrollbar-thin">
        {/* ── IDENTITY ─────────────────────────────────── */}
        <div className="mb-3">
          <SectionHead
            color="bg-accent"
            label="Identity"
            open={openSections.identity}
            onToggle={() => toggle('identity')}
          />
          {openSections.identity && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">NPC Name</label>
                <input
                  className="w-full bg-background border border-border/50 rounded px-2 py-1.5 text-[12px] text-foreground font-mono focus:outline-none focus:border-accent"
                  value={config.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="e.g. Ashbone Sentinel"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Size</label>
                  <select
                    className="w-full bg-background border border-border/50 rounded px-2 py-1.5 text-[12px] text-foreground font-mono focus:outline-none focus:border-accent appearance-none cursor-pointer"
                    value={config.size}
                    onChange={(e) => update({ size: e.target.value })}
                  >
                    {sizes.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Tier</label>
                  <div className="flex gap-1 flex-wrap">
                    {tierNumbers.map((t) => (
                      <button
                        key={t}
                        onClick={() => update({ tier: t })}
                        className={cn(
                          'w-7 h-7 rounded-full border text-[11px] font-mono transition-all',
                          config.tier === t
                            ? 'bg-accent border-accent-bright text-background font-medium'
                            : 'bg-background border-border/50 text-muted-foreground hover:border-accent-bright hover:text-accent-bright'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── TYPE ─────────────────────────────────────── */}
        <div className="mb-3">
          <SectionHead
            color="bg-teal"
            label="Inhabitant Type"
            open={openSections.type}
            onToggle={() => toggle('type')}
          />
          {openSections.type && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Primary</label>
                <select
                  className="w-full bg-background border border-border/50 rounded px-2 py-1.5 text-[12px] text-foreground font-mono focus:outline-none focus:border-teal appearance-none cursor-pointer"
                  value={config.inhabitantPrimary}
                  onChange={(e) => update({ inhabitantPrimary: e.target.value })}
                >
                  {inhabitants.map((i) => (
                    <option key={i.id} value={i.name}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Secondary{' '}
                  <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <select
                  className="w-full bg-background border border-border/50 rounded px-2 py-1.5 text-[12px] text-foreground font-mono focus:outline-none focus:border-teal appearance-none cursor-pointer"
                  value={config.inhabitantSecondary ?? ''}
                  onChange={(e) => update({ inhabitantSecondary: e.target.value || undefined })}
                >
                  <option value="">— none —</option>
                  {inhabitants.map((i) => (
                    <option key={i.id} value={i.name}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── COMBAT ROLE ───────────────────────────────── */}
        <div className="mb-3">
          <SectionHead
            color="bg-red-500"
            label="Combat Role"
            open={openSections.role}
            onToggle={() => toggle('role')}
          />
          {openSections.role && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1.5">Chassis</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {chassis.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => update({ chassis: c.id })}
                      className={cn(
                        'bg-background border rounded py-1.5 text-[11px] font-mono transition-all text-center',
                        config.chassis === c.id
                          ? 'border-blue-400 text-blue-300 bg-blue-900/20'
                          : 'border-border/50 text-muted-foreground hover:border-blue-400 hover:text-blue-300'
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1.5">
                  Trait Overlay
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {overlays.map((o) => (
                    <button
                      key={o.id}
                      onClick={() =>
                        update({
                          traitOverlay: o.id as BuildConfig['traitOverlay'],
                          hordeSize: o.id !== 'horde' ? undefined : config.hordeSize ?? 3,
                        })
                      }
                      className={cn(
                        'border rounded-full px-3 py-1 text-[11px] font-mono transition-all',
                        config.traitOverlay === o.id
                          ? o.id === 'elite'
                            ? 'bg-yellow-900/20 border-yellow-400 text-yellow-300'
                            : o.id === 'minion'
                            ? 'bg-blue-900/20 border-blue-400 text-blue-300'
                            : o.id === 'horde'
                            ? 'bg-orange-900/20 border-orange-400 text-orange-300'
                            : 'bg-surface border-border/60 text-foreground'
                          : 'bg-background border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                      )}
                    >
                      {o.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── HORDE (conditional) ───────────────────────── */}
        {config.traitOverlay === 'horde' && (
          <div className="mb-3">
            <SectionHead
              color="bg-orange-400"
              label="Horde"
              open={openSections.horde}
              onToggle={() => toggle('horde')}
            />
            {openSections.horde && (
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Horde Size (1–6)
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  className="w-full bg-background border border-border/50 rounded px-2 py-1.5 text-[12px] text-foreground font-mono focus:outline-none focus:border-orange-400"
                  value={config.hordeSize ?? 1}
                  onChange={(e) => update({ hordeSize: parseInt(e.target.value, 10) })}
                />
              </div>
            )}
          </div>
        )}

        {/* ── CASTING ───────────────────────────────────── */}
        <div className="mb-3">
          <SectionHead
            color="bg-purple-400"
            label="Casting"
            open={openSections.casting}
            onToggle={() => toggle('casting')}
          />
          {openSections.casting && (
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {(['none', 'hybrid', 'full'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() =>
                      update({
                        castingMode: mode,
                        castingAttribute:
                          mode !== 'none' ? (config.castingAttribute ?? 'will') : undefined,
                      })
                    }
                    className={cn(
                      'flex-1 border rounded py-1.5 text-[11px] font-mono text-center transition-all',
                      config.castingMode === mode
                        ? 'bg-teal/10 border-teal text-teal'
                        : 'bg-background border-border/50 text-muted-foreground hover:border-teal hover:text-teal'
                    )}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              {config.castingMode !== 'none' && (
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">
                    Casting Attribute
                  </label>
                  <select
                    className="w-full bg-background border border-border/50 rounded px-2 py-1.5 text-[12px] text-foreground font-mono focus:outline-none focus:border-teal appearance-none cursor-pointer"
                    value={config.castingAttribute ?? 'will'}
                    onChange={(e) =>
                      update({
                        castingAttribute: e.target.value as BuildConfig['castingAttribute'],
                      })
                    }
                  >
                    <option value="body">Body</option>
                    <option value="mind">Mind</option>
                    <option value="will">Will</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── LOADOUT ───────────────────────────────────── */}
        <div className="mb-3">
          <SectionHead
            color="bg-yellow-400"
            label="Loadout"
            open={openSections.loadout}
            onToggle={() => toggle('loadout')}
          />
          {openSections.loadout && (
            <div className="space-y-4">
              {/* Attacks */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Attacks
                  </span>
                  <button
                    onClick={addAttack}
                    className="text-[11px] text-accent hover:text-accent-bright border border-border/50 hover:border-accent rounded px-2 py-0.5 font-mono"
                  >
                    + Add
                  </button>
                </div>
                {(config.customAttacks ?? []).map((atk, idx) => (
                  <div
                    key={atk.id}
                    className="mb-2 p-2 bg-surface/50 border border-border/30 rounded space-y-1.5"
                  >
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">Name</label>
                        <input
                          className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-accent"
                          value={atk.name}
                          onChange={(e) => updateAttack(idx, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">Atk Bonus</label>
                        <input
                          type="number"
                          className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-accent"
                          value={atk.attackBonus}
                          onChange={(e) => updateAttack(idx, { attackBonus: parseInt(e.target.value, 10) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">Damage</label>
                        <input
                          className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-accent"
                          value={atk.damage}
                          onChange={(e) => updateAttack(idx, { damage: e.target.value })}
                          placeholder="2d8+4"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">Type</label>
                        <input
                          className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-accent"
                          value={atk.damageType}
                          onChange={(e) => updateAttack(idx, { damageType: e.target.value })}
                          placeholder="Slash"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">Range</label>
                        <input
                          className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-accent"
                          value={atk.range}
                          onChange={(e) => updateAttack(idx, { range: e.target.value })}
                          placeholder="Melee"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-0.5">Notes</label>
                      <div className="flex gap-1">
                        <input
                          className="flex-1 bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-accent"
                          value={atk.notes ?? ''}
                          onChange={(e) => updateAttack(idx, { notes: e.target.value })}
                          placeholder="optional"
                        />
                        <button
                          onClick={() => removeAttack(idx)}
                          className="text-[11px] text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-400 rounded px-1.5 font-mono"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Passive Traits */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Passive Traits
                  </span>
                  <button
                    onClick={addTrait}
                    className="text-[11px] text-teal hover:text-teal border border-border/50 hover:border-teal rounded px-2 py-0.5 font-mono"
                  >
                    + Add
                  </button>
                </div>
                {(config.customTraits ?? []).map((trait, idx) => (
                  <div
                    key={trait.id}
                    className="mb-2 p-2 bg-surface/50 border border-border/30 rounded space-y-1.5"
                  >
                    <div className="flex gap-1">
                      <input
                        className="flex-1 bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-teal"
                        value={trait.name}
                        onChange={(e) => updateTrait(idx, { name: e.target.value })}
                        placeholder="Trait name"
                      />
                      <button
                        onClick={() => removeTrait(idx)}
                        className="text-[11px] text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-400 rounded px-1.5 font-mono"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-teal resize-none"
                      rows={2}
                      value={trait.description}
                      onChange={(e) => updateTrait(idx, { description: e.target.value })}
                      placeholder="Trait description..."
                    />
                  </div>
                ))}
              </div>

              {/* Adversarial Actions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Adversarial Actions
                  </span>
                  <button
                    onClick={addAdversarialAction}
                    className="text-[11px] text-purple-400 hover:text-purple-300 border border-border/50 hover:border-purple-400 rounded px-2 py-0.5 font-mono"
                  >
                    + Add
                  </button>
                </div>
                {(config.customAdversarialActions ?? []).map((action, idx) => (
                  <div
                    key={action.id}
                    className="mb-2 p-2 bg-surface/50 border border-border/30 rounded space-y-1.5"
                  >
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-muted-foreground mb-0.5">Name</label>
                        <input
                          className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-purple-400"
                          value={action.name}
                          onChange={(e) => updateAction(idx, { name: e.target.value })}
                          placeholder="Action name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-0.5">AP Cost</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-purple-400"
                          value={action.cost}
                          onChange={(e) => updateAction(idx, { cost: parseInt(e.target.value, 10) })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <textarea
                        className="flex-1 bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-purple-400 resize-none"
                        rows={2}
                        value={action.description}
                        onChange={(e) => updateAction(idx, { description: e.target.value })}
                        placeholder="Action description..."
                      />
                      <button
                        onClick={() => removeAction(idx)}
                        className="self-start text-[11px] text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-400 rounded px-1.5 py-1 font-mono"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spells (if casting enabled) */}
              {config.castingMode !== 'none' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Spells
                    </span>
                    <button
                      onClick={addSpell}
                      className="text-[11px] text-teal hover:text-teal border border-border/50 hover:border-teal rounded px-2 py-0.5 font-mono"
                    >
                      + Add
                    </button>
                  </div>
                  {(config.spells ?? []).map((spell, idx) => (
                    <div
                      key={spell.id}
                      className="mb-2 p-2 bg-surface/50 border border-border/30 rounded"
                    >
                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="block text-[10px] text-muted-foreground mb-0.5">Rank</label>
                          <input
                            type="number"
                            min={0}
                            max={10}
                            className="w-full bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-teal"
                            value={spell.rank}
                            onChange={(e) => updateSpell(idx, { rank: parseInt(e.target.value, 10) })}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] text-muted-foreground mb-0.5">Name</label>
                          <div className="flex gap-1">
                            <input
                              className="flex-1 bg-background border border-border/40 rounded px-1.5 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:border-teal"
                              value={spell.name}
                              onChange={(e) => updateSpell(idx, { name: e.target.value })}
                              placeholder="Spell name"
                            />
                            <button
                              onClick={() => removeSpell(idx)}
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
          )}
        </div>

        {/* ── NOTES ─────────────────────────────────────── */}
        <div className="mb-3">
          <SectionHead
            color="bg-muted-foreground"
            label="Notes"
            open={openSections.notes}
            onToggle={() => toggle('notes')}
          />
          {openSections.notes && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Flavor / Notes</label>
                <textarea
                  className="w-full bg-background border border-border/50 rounded px-2 py-1.5 text-[12px] text-foreground font-mono focus:outline-none focus:border-accent resize-none"
                  rows={3}
                  value={config.notes ?? ''}
                  onChange={(e) => update({ notes: e.target.value })}
                  placeholder="Flavor text, encounter notes..."
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Tags{' '}
                  <span className="text-muted-foreground/60">(comma separated)</span>
                </label>
                <input
                  className="w-full bg-background border border-border/50 rounded px-2 py-1.5 text-[12px] text-foreground font-mono focus:outline-none focus:border-accent"
                  value={(config.tags ?? []).join(', ')}
                  onChange={(e) =>
                    update({
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="undead, melee, boss..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
