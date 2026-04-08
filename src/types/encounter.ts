export type Difficulty = 'None' | 'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Deadly';

export interface EncounterGroup {
  id: string;
  name: string;
  tier: number;
  count: number;
}

export interface EncounterState {
  partyTier: number;
  playerCount: number;
  groups: EncounterGroup[];
}

export interface ComputedGroup {
  id: string;
  relativeTier: number;
  adpEach: number;
  adpTotal: number;
}

export interface EncounterResult {
  totalAdp: number;
  enemyCount: number;
  difficulty: Difficulty;
  notes: string;
  warnings: string[];
  groups: ComputedGroup[];
}
