/**
 * Seed historical yield data for each plot
 * Based on real Indian agricultural yield statistics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Historical yield data per crop type (tonnes/hectare)
// Based on India's actual agricultural statistics
const YIELD_DATA: Record<string, { expected: number; variance: number }> = {
  rice:     { expected: 4.2, variance: 0.8 },
  wheat:    { expected: 3.4, variance: 0.6 },
  pulses:   { expected: 1.1, variance: 0.3 },
  cotton:   { expected: 1.7, variance: 0.4 },
  sugarcane:{ expected: 68, variance: 12 },
};

// Seasonal rainfall norms (mm per season)
const SEASON_RAINFALL: Record<string, number> = {
  kharif: 850,
  rabi: 200,
  zaid: 300,
};

// Seasonal temperature norms (°C)
const SEASON_TEMP: Record<string, number> = {
  kharif: 28,
  rabi: 20,
  zaid: 33,
};

export async function seedYieldHistory() {
  console.log('🌾 Seeding historical yield data...');

  const plots = await prisma.plot.findMany();
  let totalCreated = 0;

  for (const plot of plots) {
    const cropConfig = YIELD_DATA[plot.cropType] || YIELD_DATA.rice;
    const normalRainfall = SEASON_RAINFALL[plot.cropSeason] || 850;
    const normalTemp = SEASON_TEMP[plot.cropSeason] || 28;

    // Generate 5 years of history (2021-2025)
    for (let year = 2021; year <= 2025; year++) {
      // Simulate varying conditions year by year
      const yearDroughtFactor = getYearDroughtFactor(year, plot.centerLat, plot.centerLng);

      const totalRainfall = normalRainfall * yearDroughtFactor;
      const avgTemp = normalTemp + (yearDroughtFactor < 0.8 ? 2.5 : 0);
      const avgNdvi = 0.65 * yearDroughtFactor;

      // Calculate actual yield based on weather
      const yieldFactor = Math.max(0.3, yearDroughtFactor * 0.8 + (Math.random() * 0.2));
      const actualYield = cropConfig.expected * yieldFactor;
      const expectedYield = cropConfig.expected;
      const yieldDeviation = ((expectedYield - actualYield) / expectedYield) * 100;

      // Count drought events (days below 40% of normal rainfall)
      const droughtEvents = yearDroughtFactor < 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;

      await prisma.yieldHistory.upsert({
        where: {
          plotId_year_season: {
            plotId: plot.id,
            year,
            season: plot.cropSeason,
          },
        },
        update: {
          actualYield: Math.round(actualYield * 100) / 100,
          expectedYield: Math.round(expectedYield * 100) / 100,
          yieldDeviation: Math.round(yieldDeviation * 100) / 100,
          totalRainfall: Math.round(totalRainfall),
          avgTemperature: Math.round(avgTemp * 10) / 10,
          avgNdvi: Math.round(avgNdvi * 1000) / 1000,
          droughtEvents,
        },
        create: {
          plotId: plot.id,
          year,
          season: plot.cropSeason,
          actualYield: Math.round(actualYield * 100) / 100,
          expectedYield: Math.round(expectedYield * 100) / 100,
          yieldDeviation: Math.round(yieldDeviation * 100) / 100,
          totalRainfall: Math.round(totalRainfall),
          avgTemperature: Math.round(avgTemp * 10) / 10,
          avgNdvi: Math.round(avgNdvi * 1000) / 1000,
          droughtEvents,
          source: 'synthetic',
        },
      });

      totalCreated++;
    }
  }

  console.log(`✅ Seeded ${totalCreated} yield history records for ${plots.length} plots`);
}

/**
 * Simulate year-specific drought patterns
 * Some years are historically drier in certain regions
 */
function getYearDroughtFactor(year: number, lat: number, lng: number): number {
  // 2023 was a major drought year in northern India
  const baseFactors: Record<number, number> = {
    2021: 0.95,
    2022: 0.88,
    2023: 0.65,
    2024: 0.92,
    2025: 0.78,
  };

  let factor = baseFactors[year] || 0.9;

  // Northern India more affected in 2023
  if (year === 2023 && lat > 25) {
    factor *= 0.7;
  }

  // Add some random variation
  factor += (Math.random() - 0.5) * 0.1;

  return Math.max(0.3, Math.min(1.2, factor));
}

// Run directly
if (true) {
  seedYieldHistory()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
