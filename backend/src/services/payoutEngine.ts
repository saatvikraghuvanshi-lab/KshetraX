/**
 * KshetraX Payout Engine
 * 
 * Core formula engine that calculates:
 * 1. Risk Index (composite score)
 * 2. Trigger detection (threshold crossing)
 * 3. Payout amount (tiered slabs)
 */

import { CROP_SENSITIVITY, PAYOUT_SLABS, CropConfig } from '../config';

export interface WeatherInputs {
  rainfallMm: number;
  normalRainfall: number;
  temperatureC: number;
  normalTemperature: number;
  ndvi: number | null;
  historicalNdvi: number | null;
  soilMoisture: number | null; // percentage 0-100
}

export interface RiskAssessment {
  rainfallDeviation: number;    // percentage deviation from normal
  ndviDrop: number;             // NDVI drop percentage
  soilMoistureDeficit: number;  // soil moisture deficit percentage
  compositeRisk: number;        // 0-100 composite risk score
  severity: 'safe' | 'near_trigger' | 'triggered';
}

export interface PayoutResult {
  triggered: boolean;
  triggerType: string;
  severity: 'minor' | 'moderate' | 'severe';
  payoutPercentage: number;
  payoutMultiplier: number;
  explanation: string;
  formulaBreakdown: string;
}

/**
 * Calculate rainfall deviation from historical normal
 */
export function calculateRainfallDeviation(
  actual: number,
  normal: number
): number {
  if (normal === 0) return actual > 0 ? 0 : 0;
  return ((normal - actual) / normal) * 100; // positive = deficit
}

/**
 * Calculate NDVI drop from historical
 */
export function calculateNdviDrop(
  current: number | null,
  historical: number | null
): number {
  if (current === null || historical === null || historical === 0) return 0;
  if (current >= historical) return 0; // no drop
  return ((historical - current) / historical) * 100;
}

/**
 * Calculate soil moisture deficit
 */
export function calculateSoilMoistureDeficit(
  current: number | null
): number {
  if (current === null) return 0;
  // Normal soil moisture is ~60-80%. Deficit = how far below 60%
  const normal = 65;
  if (current >= normal) return 0;
  return ((normal - current) / normal) * 100;
}

/**
 * Compute composite risk score (0-100)
 * Weighted combination of rainfall, NDVI, and soil moisture risks
 */
export function computeCompositeRisk(
  inputs: WeatherInputs,
  cropType: string
): RiskAssessment {
  const crop = CROP_SENSITIVITY[cropType] || CROP_SENSITIVITY.rice;

  const rainfallDeviation = calculateRainfallDeviation(
    inputs.rainfallMm,
    inputs.normalRainfall
  );

  const ndviDrop = calculateNdviDrop(inputs.ndvi, inputs.historicalNdvi);

  const soilMoistureDeficit = calculateSoilMoistureDeficit(inputs.soilMoisture);

  // Normalize each to 0-100 scale
  const rainfallRisk = Math.min(100, Math.max(0, rainfallDeviation));
  const ndviRisk = Math.min(100, Math.max(0, ndviDrop));
  const soilMoistureRisk = Math.min(100, Math.max(0, soilMoistureDeficit));

  // Temperature risk (extreme heat/cold)
  const tempDeviation = Math.abs(inputs.temperatureC - inputs.normalTemperature);
  const tempRisk = Math.min(100, tempDeviation * 5); // rough scaling

  // Weighted composite
  const compositeRisk =
    crop.rainfallWeight * rainfallRisk +
    crop.ndviWeight * ndviRisk +
    crop.soilMoistureWeight * soilMoistureRisk +
    0.05 * tempRisk; // small temperature weight

  // Determine severity
  let severity: 'safe' | 'near_trigger' | 'triggered';
  if (compositeRisk < 25) {
    severity = 'safe';
  } else if (compositeRisk < 45) {
    severity = 'near_trigger';
  } else {
    severity = 'triggered';
  }

  return {
    rainfallDeviation,
    ndviDrop,
    soilMoistureDeficit,
    compositeRisk: Math.round(compositeRisk * 100) / 100,
    severity,
  };
}

/**
 * Detect if a trigger event has occurred
 * Returns trigger details if threshold is crossed
 */
export function detectTrigger(
  inputs: WeatherInputs,
  cropType: string,
  thresholds: {
    rainfallDeviation: number;
    ndviDrop: number;
    soilMoisture: number;
  }
): PayoutResult | null {
  const crop = CROP_SENSITIVITY[cropType] || CROP_SENSITIVITY.rice;
  const risk = computeCompositeRisk(inputs, cropType);

  // Check individual thresholds
  const rainfallTriggered = risk.rainfallDeviation >= thresholds.rainfallDeviation;
  const ndviTriggered = risk.ndviDrop >= thresholds.ndviDrop;
  const soilTriggered = risk.soilMoistureDeficit >= thresholds.soilMoisture;

  // Determine if ANY threshold is crossed
  if (!rainfallTriggered && !ndviTriggered && !soilTriggered) {
    return null; // No trigger
  }

  // Determine primary trigger type
  let triggerType: string;
  if (rainfallTriggered && ndviTriggered) {
    triggerType = 'combined';
  } else if (rainfallTriggered) {
    triggerType = 'rainfall_deficit';
  } else if (ndviTriggered) {
    triggerType = 'ndvi_drop';
  } else {
    triggerType = 'soil_moisture_deficit';
  }

  // Determine severity based on worst deviation
  const maxDeviation = Math.max(
    risk.rainfallDeviation,
    risk.ndviDrop,
    risk.soilMoistureDeficit
  );

  let severity: 'minor' | 'moderate' | 'severe';
  if (maxDeviation >= PAYOUT_SLABS.severe.min) {
    severity = 'severe';
  } else if (maxDeviation >= PAYOUT_SLABS.moderate.min) {
    severity = 'moderate';
  } else {
    severity = 'minor';
  }

  // Calculate payout using tiered slabs
  const slab = PAYOUT_SLABS[severity];
  const payoutPercentage = slab.multiplier * 100;

  // Generate plain language explanation
  const explanation = generateExplanation(
    risk, severity, triggerType, crop, maxDeviation
  );

  const formulaBreakdown = generateFormulaBreakdown(
    risk, severity, slab, crop
  );

  return {
    triggered: true,
    triggerType,
    severity,
    payoutPercentage,
    payoutMultiplier: slab.multiplier,
    explanation,
    formulaBreakdown,
  };
}

/**
 * Calculate payout amount
 */
export function calculatePayout(
  sumInsured: number,
  payoutResult: PayoutResult
): number {
  return sumInsured * payoutResult.payoutMultiplier;
}

/**
 * Generate plain language explanation for the farmer
 */
function generateExplanation(
  risk: RiskAssessment,
  severity: string,
  triggerType: string,
  crop: CropConfig,
  maxDeviation: number
): string {
  const parts: string[] = [];

  if (triggerType === 'rainfall_deficit' || triggerType === 'combined') {
    parts.push(
      `Rainfall is ${risk.rainfallDeviation.toFixed(1)}% below normal for ${crop.name} season.`
    );
  }

  if (triggerType === 'ndvi_drop' || triggerType === 'combined') {
    parts.push(
      `Crop health (NDVI) has dropped ${risk.ndviDrop.toFixed(1)}% from expected levels.`
    );
  }

  if (triggerType === 'soil_moisture_deficit') {
    parts.push(
      `Soil moisture deficit of ${risk.soilMoistureDeficit.toFixed(1)}% detected.`
    );
  }

  const severityLabel =
    severity === 'severe'
      ? 'SEVERE loss'
      : severity === 'moderate'
      ? 'MODERATE loss'
      : 'MINOR loss';

  parts.push(
    `This indicates ${severityLabel}. Your parametric insurance policy automatically triggers a payout.`
  );

  parts.push(
    `Composite risk score: ${risk.compositeRisk.toFixed(1)}/100.`
  );

  return parts.join(' ');
}

/**
 * Generate formula breakdown for transparency
 */
function generateFormulaBreakdown(
  risk: RiskAssessment,
  severity: string,
  slab: typeof PAYOUT_SLABS.minor,
  crop: CropConfig
): string {
  return [
    `Formula: Payout = Sum Insured × Tier Multiplier`,
    `Composite Risk = (${crop.rainfallWeight} × ${risk.rainfallDeviation.toFixed(1)}%) + (${crop.ndviWeight} × ${risk.ndviDrop.toFixed(1)}%) + (${crop.soilMoistureWeight} × ${risk.soilMoistureDeficit.toFixed(1)}%)`,
    `Severity: ${severity.toUpperCase()} (${slab.min}-${slab.max}% deviation range)`,
    `Tier Multiplier: ${slab.multiplier} (${(slab.multiplier * 100).toFixed(0)}% of sum insured)`,
    `Payout = Sum Insured × ${slab.multiplier}`,
  ].join('\n');
}

/**
 * Calculate premium based on risk assessment
 */
export function calculatePremium(
  riskScore: number,
  areaHectares: number,
  cropType: string
): { premium: number; premiumPerHectare: number } {
  const crop = CROP_SENSITIVITY[cropType] || CROP_SENSITIVITY.rice;

  // Base premium rate: higher risk = higher premium
  // Base rate: 3% of expected crop value for low risk
  // Scales up to 8% for high risk
  const expectedYieldValue = crop.baseYieldPerHa * crop.pricePerKg * 1000; // INR per hectare
  const premiumRate = 0.03 + (riskScore / 100) * 0.05; // 3% to 8%

  const premiumPerHectare = expectedYieldValue * premiumRate;
  const premium = premiumPerHectare * areaHectares;

  return {
    premium: Math.round(premium * 100) / 100,
    premiumPerHectare: Math.round(premiumPerHectare * 100) / 100,
  };
}
