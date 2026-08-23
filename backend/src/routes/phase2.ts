/**
 * Phase 2 API Routes
 *
 * Enhanced data: yield history, multi-station, risk trends
 */

import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { WEATHER_STATIONS, findNearestStation } from '../services/weatherService';
import { CROP_SENSITIVITY } from '../config';

const router = Router();

/**
 * GET /api/yield-history/:plotId - Get historical yield data for a plot
 * Shows yield correlation with rainfall, temperature, NDVI over years
 */
router.get('/yield-history/:plotId', async (req: Request, res: Response) => {
  try {
    const { plotId } = req.params;

    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
      include: { yieldHistory: { orderBy: { year: 'asc' } } },
    });

    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    const yieldData = plot.yieldHistory;
    const cropConfig = CROP_SENSITIVITY[plot.cropType] || CROP_SENSITIVITY.rice;

    // Calculate correlation: rainfall vs yield
    const avgYield = yieldData.reduce((s, y) => s + y.actualYield, 0) / yieldData.length;
    const avgRainfall = yieldData.reduce((s, y) => s + y.totalRainfall, 0) / yieldData.length;

    // Simple correlation coefficient
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    for (const y of yieldData) {
      const dx = y.totalRainfall - avgRainfall;
      const dy = y.actualYield - avgYield;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }
    const correlation = denomX > 0 && denomY > 0
      ? Math.round((numerator / Math.sqrt(denomX * denomY)) * 100) / 100
      : 0;

    // Drought impact analysis
    const droughtYears = yieldData.filter(y => y.droughtEvents > 0);
    const avgDroughtYieldLoss = droughtYears.length > 0
      ? droughtYears.reduce((s, y) => s + y.yieldDeviation, 0) / droughtYears.length
      : 0;

    res.json({
      plot: {
        id: plot.id,
        name: plot.name,
        cropType: plot.cropType,
        areaHectares: plot.areaHectares,
      },
      cropSensitivity: {
        rainfallWeight: cropConfig.rainfallWeight,
        ndviWeight: cropConfig.ndviWeight,
        soilMoistureWeight: cropConfig.soilMoistureWeight,
        criticalStage: cropConfig.criticalStage,
        baseYieldPerHa: cropConfig.baseYieldPerHa,
        pricePerKg: cropConfig.pricePerKg,
      },
      yieldHistory: yieldData.map(y => ({
        year: y.year,
        season: y.season,
        actualYield: y.actualYield,
        expectedYield: y.expectedYield,
        yieldDeviation: y.yieldDeviation,
        totalRainfall: y.totalRainfall,
        avgTemperature: y.avgTemperature,
        avgNdvi: y.avgNdvi,
        droughtEvents: y.droughtEvents,
      })),
      correlation: {
        rainfallYieldCorrelation: correlation,
        avgYieldDeviation: Math.round(avgDroughtYieldLoss * 100) / 100,
        droughtYearsCount: droughtYears.length,
        totalYearsAnalyzed: yieldData.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch yield history', details: error.message });
  }
});

/**
 * GET /api/yield-history - Get yield summary across all plots
 */
router.get('/yield-history', async (_req: Request, res: Response) => {
  try {
    const yieldData = await prisma.yieldHistory.groupBy({
      by: ['plotId'],
      _avg: { actualYield: true, yieldDeviation: true, totalRainfall: true },
      _count: true,
    });

    const summary = await Promise.all(
      yieldData.map(async (yd) => {
        const plot = await prisma.plot.findUnique({
          where: { id: yd.plotId },
          select: { id: true, name: true, cropType: true, areaHectares: true },
        });
        return {
          plot,
          avgYield: yd._avg.actualYield,
          avgDeviation: yd._avg.yieldDeviation,
          avgRainfall: yd._avg.totalRainfall,
          yearsOfData: yd._count,
        };
      })
    );

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch yield summary', details: error.message });
  }
});

/**
 * GET /api/stations/all - List all weather stations with redundancy info
 */
router.get('/stations', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (lat && lng) {
      // Find nearest stations (top 3 for redundancy)
      const allStations = WEATHER_STATIONS.map(station => {
        const dist = Math.sqrt(
          Math.pow(station.lat - parseFloat(lat as string), 2) +
          Math.pow(station.lng - parseFloat(lng as string), 2)
        );
        return { ...station, distanceKm: Math.round(dist * 111) };
      }).sort((a, b) => a.distanceKm - b.distanceKm);

      return res.json({
        nearest: allStations[0],
        backup: allStations.slice(1, 4),
        all: allStations,
      });
    }

    // Return all stations
    res.json({ stations: WEATHER_STATIONS });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch stations', details: error.message });
  }
});

/**
 * GET /api/risk-trends - Get risk index trends over time
 */
router.get('/risk-trends', async (_req: Request, res: Response) => {
  try {
    const riskIndices = await prisma.riskIndex.findMany({
      orderBy: { date: 'asc' },
    });

    // Group by month for trend display
    const monthlyTrends: Record<string, {
      avgComposite: number;
      avgRainfall: number;
      avgNdvi: number;
      avgSoil: number;
      count: number;
    }> = {};

    for (const ri of riskIndices) {
      const monthKey = ri.date.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = { avgComposite: 0, avgRainfall: 0, avgNdvi: 0, avgSoil: 0, count: 0 };
      }
      monthlyTrends[monthKey].avgComposite += ri.compositeScore;
      monthlyTrends[monthKey].avgRainfall += ri.rainfallRisk;
      monthlyTrends[monthKey].avgNdvi += ri.ndviRisk;
      monthlyTrends[monthKey].avgSoil += ri.soilMoistureRisk;
      monthlyTrends[monthKey].count++;
    }

    // Average out
    const trends = Object.entries(monthlyTrends).map(([month, data]) => ({
      month,
      avgCompositeRisk: Math.round(data.avgComposite / data.count * 100) / 100,
      avgRainfallRisk: Math.round(data.avgRainfall / data.count * 100) / 100,
      avgNdviRisk: Math.round(data.avgNdvi / data.count * 100) / 100,
      avgSoilMoistureRisk: Math.round(data.avgSoil / data.count * 100) / 100,
      dataPoints: data.count,
    }));

    res.json(trends);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch risk trends', details: error.message });
  }
});

/**
 * GET /api/crop-sensitivity - Get crop-specific sensitivity configurations
 */
router.get('/crop-sensitivity', async (_req: Request, res: Response) => {
  try {
    const crops = Object.entries(CROP_SENSITIVITY).map(([key, config]) => ({
      type: key,
      ...config,
      // Calculate expected payout scenarios
      scenarios: [
        { label: 'Minor Drought', deviation: 25, expectedPayout: '25% of sum insured' },
        { label: 'Moderate Drought', deviation: 45, expectedPayout: '50% of sum insured' },
        { label: 'Severe Drought', deviation: 70, expectedPayout: '100% of sum insured' },
      ],
    }));

    res.json(crops);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch crop sensitivity', details: error.message });
  }
});

export default router;
