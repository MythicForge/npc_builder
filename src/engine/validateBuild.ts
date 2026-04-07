import type { BuildConfig, ValidationWarning } from '@/types/npc';
import type { BuildRules } from '@/types/data';

/**
 * Step 9: Validate build configuration and return an array of ValidationWarning objects.
 * 'error' severity warnings block export; 'warning' are advisory only.
 */
export function validateBuild(
  config: BuildConfig,
  buildRules: BuildRules
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (!config.name || config.name.trim() === '') {
    warnings.push({ severity: 'error', code: 'EMPTY_NAME', message: 'NPC name is required.' });
  }

  // Full caster chassis check
  if (
    config.castingMode === 'full' &&
    !buildRules.full_caster_allowed_chassis.includes(config.chassis.toLowerCase())
  ) {
    warnings.push({
      severity: 'error',
      code: 'FULL_CASTER_INVALID_CHASSIS',
      message: `Full Caster mode requires the Caster chassis. "${config.chassis}" does not support it.`,
    });
  }

  // Hybrid caster chassis check
  if (
    config.castingMode === 'hybrid' &&
    !buildRules.hybrid_caster_allowed_chassis.includes(config.chassis.toLowerCase())
  ) {
    warnings.push({
      severity: 'error',
      code: 'HYBRID_CASTER_INVALID_CHASSIS',
      message: `"${config.chassis}" chassis cannot be a hybrid caster.`,
    });
  }

  // Secondary inhabitant check
  if (config.inhabitantSecondary && !buildRules.secondary_inhabitant_allowed) {
    warnings.push({
      severity: 'error',
      code: 'SECONDARY_INHABITANT_DISABLED',
      message: 'Secondary inhabitant type is not allowed by current rules.',
    });
  }

  // Casting attribute required when casting is enabled
  if (config.castingMode !== 'none' && !config.castingAttribute) {
    warnings.push({
      severity: 'error',
      code: 'MISSING_CAST_ATTR',
      message: 'A casting attribute (Body / Mind / Will) is required when casting is enabled.',
    });
  }

  // Casting attribute type check
  const validAttrs = ['body', 'mind', 'will'];
  if (config.castingAttribute && !validAttrs.includes(config.castingAttribute)) {
    warnings.push({
      severity: 'error',
      code: 'INVALID_CAST_ATTR',
      message: `Invalid casting attribute: "${config.castingAttribute}". Must be body, mind, or will.`,
    });
  }

  // Horde size validation
  if (config.traitOverlay === 'horde' && (config.hordeSize == null || isNaN(config.hordeSize))) {
    warnings.push({
      severity: 'error',
      code: 'HORDE_MISSING_SIZE',
      message: 'Horde overlay requires a horde size value.',
    });
  }

  if (config.traitOverlay === 'horde' && config.hordeSize != null) {
    if (config.hordeSize < buildRules.horde_min_size || !Number.isInteger(config.hordeSize)) {
      warnings.push({
        severity: 'error',
        code: 'HORDE_INVALID_SIZE',
        message: `Horde size must be an integer >= ${buildRules.horde_min_size}.`,
      });
    }
  }

  // Advisory: caster chassis with no casting
  if (config.chassis.toLowerCase() === 'caster' && config.castingMode === 'none') {
    warnings.push({
      severity: 'warning',
      code: 'CASTER_NO_SPELLS',
      message: 'Caster chassis with no casting mode set may underperform. Consider enabling Full or Hybrid casting.',
    });
  }

  // Advisory: hybrid on a caster chassis
  if (config.castingMode === 'hybrid' && config.chassis.toLowerCase() === 'caster') {
    warnings.push({
      severity: 'warning',
      code: 'HYBRID_ON_CASTER',
      message: 'Hybrid casting on a Caster chassis may underutilize the chassis. Consider Full Caster.',
    });
  }

  return warnings;
}
