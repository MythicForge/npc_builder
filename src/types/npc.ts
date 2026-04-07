export interface BuildConfig {
  name: string;
  tier: number;
  size: string;
  inhabitantPrimary: string;
  inhabitantSecondary?: string;
  chassis: string;
  traitOverlay: 'none' | 'elite' | 'minion' | 'horde';
  hordeSize?: number;
  castingMode: 'none' | 'full' | 'hybrid';
  castingAttribute?: 'body' | 'mind' | 'will';
  customAttacks: Attack[];
  customTraits: Trait[];
  customAdversarialActions: AdversarialAction[];
  spells: SpellEntry[];
  notes?: string;
  tags?: string[];
}

export interface Attack {
  id: string;
  name: string;
  attackBonus: number;
  damage: string;
  damageType: string;
  range: string;
  notes?: string;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
}

export interface AdversarialAction {
  id: string;
  name: string;
  cost: number;
  description: string;
}

export interface SpellEntry {
  id: string;
  rank: number;
  name: string;
  uses?: number;
}

export interface SpellSection {
  attribute: string;
  dc: number;
  spells: SpellEntry[];
}

export interface HordeState {
  currentSize: number;
  maxSize: number;
  targetsPerStrike: number;
  damageBonus: string;
  vitalityBonusDicePerTier: string | null;
  unitVitality: number;
}

export interface NpcStats {
  vitality: number;
  armor: number;
  move: number;
  bodyMod: number;
  mindMod: number;
  willMod: number;
  attackBonusPrimary: number;
  attackBonusSecondary?: number;
  damagePrimary: string;
  damageSecondary?: string;
  actionPoints?: number;
  adversarialActionBudget?: number;
}

export interface NpcResult {
  name: string;
  tier: number;
  size: string;
  inhabitants: string[];
  chassis: string;
  traitOverlay: string;
  castingMode: string;
  castingAttribute?: string;
  stats: NpcStats;
  loreTags: string[];
  loreCategory: string;
  loreIdentifyDC: number;
  attacks: Attack[];
  passiveTraits: Trait[];
  adversarialActions: AdversarialAction[];
  spells?: SpellSection;
  hordeState?: HordeState;
  markdown: string;
  warnings: ValidationWarning[];
  /** Scratch field: accumulated raw defense modifier from inhabitants, rounded once in buildNpc */
  _rawDefenseMod?: number;
  /** Scratch field: tracks current damage step index offset */
  _damageStepIndex?: number;
}

export interface ValidationWarning {
  severity: 'error' | 'warning';
  code: string;
  message: string;
}
