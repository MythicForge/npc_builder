import {
  getRelativeTier,
  getAdpFromRelativeTier,
  getEncounterTotalAdp,
  getEncounterDifficultyLabel,
  getDifficultyNotes,
  getEncounterWarnings,
  computeEncounter,
} from '../encounterMath';
import type { EncounterGroup } from '@/types/encounter';

describe('encounterMath', () => {
  describe('getRelativeTier', () => {
    it('returns positive delta when enemy is stronger', () => {
      expect(getRelativeTier(3, 1)).toBe(2);
    });

    it('returns negative delta when enemy is weaker', () => {
      expect(getRelativeTier(1, 3)).toBe(-2);
    });

    it('returns zero when equal tier', () => {
      expect(getRelativeTier(2, 2)).toBe(0);
    });
  });

  describe('getAdpFromRelativeTier', () => {
    it('returns 0.5 for delta <= -2', () => {
      expect(getAdpFromRelativeTier(-2)).toBe(0.5);
      expect(getAdpFromRelativeTier(-5)).toBe(0.5);
    });

    it('returns 1 for delta -1', () => {
      expect(getAdpFromRelativeTier(-1)).toBe(1);
    });

    it('returns 2 for delta 0', () => {
      expect(getAdpFromRelativeTier(0)).toBe(2);
    });

    it('returns 4 for delta 1', () => {
      expect(getAdpFromRelativeTier(1)).toBe(4);
    });

    it('returns 8 for delta 2', () => {
      expect(getAdpFromRelativeTier(2)).toBe(8);
    });

    it('returns 12 for delta >= 3', () => {
      expect(getAdpFromRelativeTier(3)).toBe(12);
      expect(getAdpFromRelativeTier(5)).toBe(12);
    });
  });

  describe('getEncounterTotalAdp', () => {
    it('returns 0 for empty groups', () => {
      expect(getEncounterTotalAdp(0, [])).toBe(0);
    });

    it('calculates correct ADP for single group', () => {
      const groups: EncounterGroup[] = [
        { id: '1', name: 'Goblins', tier: 0, count: 2 },
      ];
      // Party T0, enemies T0: delta 0, ADP 2 each, total 4
      expect(getEncounterTotalAdp(0, groups)).toBe(4);
    });

    it('aggregates ADP across multiple groups', () => {
      const groups: EncounterGroup[] = [
        { id: '1', name: 'Goblins', tier: 0, count: 2 }, // T0 vs T0: 2*2 = 4
        { id: '2', name: 'Ogres', tier: 1, count: 1 },    // T1 vs T0: 1*4 = 4
      ];
      // Total: 4 + 4 = 8
      expect(getEncounterTotalAdp(0, groups)).toBe(8);
    });
  });

  describe('getEncounterDifficultyLabel', () => {
    it('returns None for 0 ADP', () => {
      expect(getEncounterDifficultyLabel(0, 4)).toBe('None');
    });

    it('returns Trivial below threshold', () => {
      // 4 players: trivial < 6
      expect(getEncounterDifficultyLabel(5, 4)).toBe('Trivial');
    });

    it('returns Easy in range', () => {
      // 4 players: easy < 12
      expect(getEncounterDifficultyLabel(10, 4)).toBe('Easy');
    });

    it('returns Medium in range', () => {
      // 4 players: medium < 16
      expect(getEncounterDifficultyLabel(14, 4)).toBe('Medium');
    });

    it('returns Hard in range', () => {
      // 4 players: hard < 20
      expect(getEncounterDifficultyLabel(18, 4)).toBe('Hard');
    });

    it('returns Deadly at threshold and above', () => {
      // 4 players: deadly >= 20
      expect(getEncounterDifficultyLabel(20, 4)).toBe('Deadly');
      expect(getEncounterDifficultyLabel(100, 4)).toBe('Deadly');
    });
  });

  describe('getDifficultyNotes', () => {
    it('returns appropriate notes for each difficulty', () => {
      expect(getDifficultyNotes('None')).toBe('No enemies added.');
      expect(getDifficultyNotes('Trivial')).toBe('Very low threat.');
      expect(getDifficultyNotes('Easy')).toBe('Light pressure.');
      expect(getDifficultyNotes('Medium')).toBe('Standard encounter.');
      expect(getDifficultyNotes('Hard')).toBe('High pressure.');
      expect(getDifficultyNotes('Deadly')).toBe('Severe threat.');
    });
  });

  describe('getEncounterWarnings', () => {
    it('warns when no enemies', () => {
      const warnings = getEncounterWarnings(0, 4, []);
      expect(warnings).toContain('No enemies added.');
    });

    it('warns when high enemy count', () => {
      const groups: EncounterGroup[] = [
        { id: '1', name: 'Mobs', tier: 0, count: 10 },
      ];
      const warnings = getEncounterWarnings(0, 4, groups);
      expect(warnings.some((w) => w.includes('High enemy count'))).toBe(true);
    });

    it('warns for weak solo enemy', () => {
      const groups: EncounterGroup[] = [
        { id: '1', name: 'Goblin', tier: -1, count: 1 },
      ];
      const warnings = getEncounterWarnings(0, 4, groups);
      expect(warnings.some((w) => w.includes('Solo enemy is very weak'))).toBe(true);
    });

    it('warns for tier spike', () => {
      const groups: EncounterGroup[] = [
        { id: '1', name: 'Dragon', tier: 4, count: 1 },
      ];
      const warnings = getEncounterWarnings(0, 4, groups);
      expect(warnings.some((w) => w.includes('Tier spike'))).toBe(true);
    });

    it('does not warn for manageable tier difference', () => {
      const groups: EncounterGroup[] = [
        { id: '1', name: 'Strong Goblin', tier: 2, count: 1 },
      ];
      const warnings = getEncounterWarnings(0, 4, groups);
      // Should not warn about tier spike (3+ difference)
      const tierWarning = warnings.find((w) => w.includes('Tier spike'));
      expect(tierWarning).toBeUndefined();
    });
  });

  describe('computeEncounter', () => {
    it('computes full result correctly', () => {
      const groups: EncounterGroup[] = [
        { id: '1', name: 'Goblins', tier: 0, count: 2 },
        { id: '2', name: 'Hobgoblin', tier: 1, count: 1 },
      ];

      const result = computeEncounter(0, 4, groups);

      expect(result.totalAdp).toBe(8); // 2*2 + 1*4
      expect(result.enemyCount).toBe(3);
      expect(result.difficulty).toBe('Hard'); // 8 < 16, but >= 6
      expect(result.notes).toBe('High pressure.');
      expect(result.groups).toHaveLength(2);
      expect(result.groups[0].adpTotal).toBe(4);
      expect(result.groups[1].adpTotal).toBe(4);
    });

    it('handles empty encounter', () => {
      const result = computeEncounter(0, 4, []);

      expect(result.totalAdp).toBe(0);
      expect(result.enemyCount).toBe(0);
      expect(result.difficulty).toBe('None');
      expect(result.warnings).toContain('No enemies added.');
    });
  });
});
