// Crop sensitivity configurations
export const CROP_SENSITIVITY: Record<string, CropConfig> = {
  rice: {
    name: 'Rice',
    minRainfall: 1000,
    criticalStage: 'flowering',
    rainfallWeight: 0.45,
    ndviWeight: 0.35,
    soilMoistureWeight: 0.20,
    baseYieldPerHa: 4.5,
    pricePerKg: 28,
  },
  wheat: {
    name: 'Wheat',
    minRainfall: 500,
    criticalStage: 'grain_filling',
    rainfallWeight: 0.40,
    ndviWeight: 0.30,
    soilMoistureWeight: 0.30,
    baseYieldPerHa: 3.5,
    pricePerKg: 22,
  },
  pulses: {
    name: 'Pulses',
    minRainfall: 400,
    criticalStage: 'flowering',
    rainfallWeight: 0.50,
    ndviWeight: 0.25,
    soilMoistureWeight: 0.25,
    baseYieldPerHa: 1.2,
    pricePerKg: 80,
  },
  cotton: {
    name: 'Cotton',
    minRainfall: 700,
    criticalStage: 'boll_development',
    rainfallWeight: 0.35,
    ndviWeight: 0.40,
    soilMoistureWeight: 0.25,
    baseYieldPerHa: 1.8,
    pricePerKg: 65,
  },
  sugarcane: {
    name: 'Sugarcane',
    minRainfall: 1500,
    criticalStage: 'tillering',
    rainfallWeight: 0.40,
    ndviWeight: 0.30,
    soilMoistureWeight: 0.30,
    baseYieldPerHa: 70,
    pricePerKg: 3.5,
  },
};

export interface CropConfig {
  name: string;
  minRainfall: number;
  criticalStage: string;
  rainfallWeight: number;
  ndviWeight: number;
  soilMoistureWeight: number;
  baseYieldPerHa: number;
  pricePerKg: number;
}

// Payout tier slabs
export const PAYOUT_SLABS = {
  minor:     { min: 0, max: 30, multiplier: 0.25 },
  moderate:  { min: 30, max: 60, multiplier: 0.50 },
  severe:    { min: 60, max: 100, multiplier: 1.0 },
};

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  stacApiUrl: process.env.STAC_API_URL || 'https://earth-search.aws.element84.com/v1',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || 'demo',
};
