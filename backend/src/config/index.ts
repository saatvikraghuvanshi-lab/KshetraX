import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory explicitly
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  stacApiUrl: process.env.STAC_API_URL || 'https://earth-search.aws.element84.com/v1',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || 'demo',
};

// Crop sensitivity configurations
export const CROP_SENSITIVITY: Record<string, CropConfig> = {
  rice: {
    name: 'Rice',
    minRainfall: 1000,   // mm per season
    criticalStage: 'flowering',
    rainfallWeight: 0.45,
    ndviWeight: 0.35,
    soilMoistureWeight: 0.20,
    baseYieldPerHa: 4.5, // tonnes per hectare
    pricePerKg: 28,       // INR
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
  minor:     { min: 0, max: 30, multiplier: 0.25 },  // 0-30% deviation → 25% of sum insured
  moderate:  { min: 30, max: 60, multiplier: 0.50 },  // 30-60% deviation → 50%
  severe:    { min: 60, max: 100, multiplier: 1.0 },  // 60%+ deviation → 100%
};
