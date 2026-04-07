// ─── Data shape types (matching JSON files) ────────────────────────────────

export interface TierData {
  tier: number;
  primary_mod_range: { min: number; max: number; open_ended?: boolean };
  defense_range: { min: number; max: number };
  vitality_range: { min: number; max: number; open_ended?: boolean };
  attack_bonus_range: { min: number; max: number };
  damage_profile: { low: string; standard: string; high: string };
  lore_dc: number;
  recommended_primary_mod: number;
  recommended_defense: number;
  recommended_vitality: number;
  recommended_attack_bonus: number;
  tier_2_plus_vitality_floor?: number;
  notes: string;
}

export interface ChassisData {
  id: string;
  name: string;
  enabled_by_default: boolean;
  vitality_multiplier: number;
  defense_modifier: number;
  attack_modifier: number;
  damage_step_modifier: number;
  attribute_modifiers: {
    body?: number;
    mind?: number;
    will?: number;
  };
  dynamic_attribute_modifier?: {
    stat_source: string;
    bonus: number;
    fallback_attribute: 'body' | 'mind' | 'will';
    applies_in_modes: string[];
    notes?: string;
  };
  weapon_bias: string;
  mobility_bias: string;
  full_caster_allowed: boolean;
  hybrid_caster_allowed: boolean;
  recommended_adversarial_actions: { min: number; max: number };
  required_tags: string[];
  notes: string;
}

export interface OverlayData {
  id: string;
  name: string;
  enabled_by_default: boolean;
  vitality_multiplier: number;
  defense_modifier: number;
  attack_modifier: number;
  damage_step_modifier: number;
  action_point_modifier?: number;
  action_point_override?: number;
  adversarial_actions_bonus?: number;
  adversarial_actions_override?: number;
  special_rules: string[];
  notes: string;
}

export interface InhabitantData {
  id: string;
  name: string;
  aliases?: string[];
  examples: string[];
  default_lore: string[];
  secondary_lore_options: string[];
  attribute_lean: { body: number; mind: number; will: number };
  suggested_chassis: string[];
  passive_tendency_tags?: string[];
  spellcasting_affinity: 'low' | 'medium' | 'high';
  notes: string;
  vitality_multiplier: number;
  defense_modifier: number;
  combat_profile_adjustment?: {
    vitality_multiplier: number;
    defense_modifier: number;
  };
}

export interface SizeData {
  id: string;
  name: string;
}

export interface HordeSizeEntry {
  size_key: string;
  size_min: number;
  size_max: number | null;
  vitality_bonus_dice_per_tier: string | null;
  damage_bonus: string;
  targets_per_strike: number;
}

export interface HordeData {
  id: string;
  name: string;
  description: string;
  global_rules: Record<string, boolean | number>;
  size_table: HordeSizeEntry[];
}

export interface CastingModeData {
  id: string;
  name: string;
  allowed_chassis: string[];
  max_spell_rank_delta_from_tier: number | null;
  offensive_spell_limit: number | null;
  known_spell_budget: string;
  notes: string;
}

export interface DamageProfileEntry {
  tier: number;
  light: string;
  standard: string;
  heavy: string;
}

export interface BuildRules {
  secondary_inhabitant_allowed: boolean;
  secondary_inhabitant_numeric_weight: number;
  final_defense_rounding_mode: 'floor' | 'round' | 'ceil' | 'nearest_integer';
  inhabitant_vitality_combination_mode?: string;
  inhabitant_defense_combination_mode?: string;
  inhabitant_vitality_formula_note?: string;
  inhabitant_defense_formula_note?: string;
  inhabitant_combat_adjustments_enabled?: boolean;
  inhabitant_adjustment_application_order?: string;
  tier_2_plus_standard_vitality_floor: number;
  full_caster_allowed_chassis: string[];
  hybrid_caster_allowed_chassis: string[];
  chassis_attribute_modifiers_enabled?: boolean;
  chassis_attribute_modifier_mode?: string;
  chassis_attribute_application_order?: string;
  caster_dynamic_stat_bonus: number;
  caster_fallback_attribute: 'body' | 'mind' | 'will';
  horde_requires_shared_base_stat_block: boolean;
  horde_requires_same_tier: boolean;
  horde_defense_scales: boolean;
  horde_min_size: number;
  minion_default_action_points: number;
  minion_default_adversarial_actions: number;
  summoned_horde_default_action_points: number;
  lore_dc_formula: string;
  default_damage_label_mode: string;
  legacy_output_stat_aliases: string[];
  notes: string[];
}
