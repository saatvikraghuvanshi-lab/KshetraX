/**
 * Weather & Monitoring API Routes
 * 
 * Ingest weather data, compute risk indices, detect triggers
 */

import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import {
  generateSyntheticWeather,
  generateWeatherTimeSeries,
  findNearestStation,
} from '../services/weatherService';
import {
  computeCompositeRisk,
  detectTrigger,
  calculatePayout,
} from '../services/payoutEngine';
import { generateSyntheticNdviTimeSeries } from '../services/satelliteService';
import { CROP_SENSITIVITY } from '../config';

const router = Router();

/**
 * POST /api/weather/generate - Generate synthetic weather data for a plot
 * (Demo endpoint - simulates weather station data ingestion)
 */
router.post('/weather/generate', async (req: Request, res: Response) => {
  try {
    const { plotId, days = 60, scenario = 'normal' } = req.body;

    if (!plotId) {
      return res.status(400).json({ error: 'plotId is required' });
    }

    const plot = await prisma.plot.findUnique({ where: { id: plotId } });
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    const startDate = new Date(plot.sowingDate);
    const weatherData = generateWeatherTimeSeries(
      startDate, days, plot.centerLat, plot.centerLng,
      scenario as any, plot.cropSeason
    );

    // Also generate NDVI data
    const ndviData = generateSyntheticNdviTimeSeries(
      startDate, days, plot.cropType,
      scenario !== 'normal'
    );

    // Clear existing weather data for this plot
    await prisma.weatherData.deleteMany({ where: { plotId } });

    // Insert weather + NDVI data
    const created = await Promise.all(
      weatherData.map(async (w, i) => {
        const ndviPoint = ndviData[i];
        return prisma.weatherData.create({
          data: {
            plotId,
            date: w.date,
            rainfallMm: w.rainfallMm,
            temperatureC: w.temperatureC,
            humidity: w.humidity,
            soilMoisture: w.soilMoisture,
            windSpeed: w.windSpeed,
            normalRainfall: w.normalRainfall,
            normalTemperature: w.normalTemperature,
            rainfallDeviation: ((w.normalRainfall - w.rainfallMm) / w.normalRainfall) * 100,
            ndvi: ndviPoint?.ndvi ?? null,
            ndviAnomaly: null,
            source: w.source,
          },
        });
      })
    );

    // Calculate NDVI anomaly (compare recent to earlier NDVI)
    if (created.length > 10) {
      const earlyNdvi = created
        .slice(0, 10)
        .filter(d => d.ndvi !== null)
        .reduce((sum, d) => sum + (d.ndvi || 0), 0) / 10;

      for (const point of created) {
        if (point.ndvi !== null) {
          const anomaly = ((point.ndvi - earlyNdvi) / earlyNdvi) * 100;
          await prisma.weatherData.update({
            where: { id: point.id },
            data: { ndviAnomaly: anomaly },
          });
        }
      }
    }

    res.json({
      message: `Generated ${created.length} weather data points`,
      scenario,
      plotId,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate weather data', details: error.message });
  }
});

/**
 * POST /api/weather/monitor - Run monitoring on a plot and check for triggers
 */
router.post('/weather/monitor', async (req: Request, res: Response) => {
  try {
    const { plotId } = req.body;

    if (!plotId) {
      return res.status(400).json({ error: 'plotId is required' });
    }

    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
      include: { insurance: true, weatherData: { orderBy: { date: 'desc' }, take: 7 } },
    });

    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    if (!plot.insurance) {
      return res.status(400).json({ error: 'Plot has no active insurance policy' });
    }

    if (plot.weatherData.length === 0) {
      return res.status(400).json({ error: 'No weather data available. Generate data first.' });
    }

    // Get latest weather data (average of last 7 days)
    const recentWeather = plot.weatherData;
    const avgRainfall = recentWeather.reduce((s, w) => s + w.rainfallMm, 0) / recentWeather.length;
    const avgTemp = recentWeather.reduce((s, w) => s + w.temperatureC, 0) / recentWeather.length;
    const avgNdvi = recentWeather.filter(w => w.ndvi !== null).reduce((s, w) => s + (w.ndvi || 0), 0) /
      Math.max(1, recentWeather.filter(w => w.ndvi !== null).length);
    const avgSoilMoisture = recentWeather.filter(w => w.soilMoisture !== null)
      .reduce((s, w) => s + (w.soilMoisture || 0), 0) /
      Math.max(1, recentWeather.filter(w => w.soilMoisture !== null).length);

    const normalRainfall = recentWeather[recentWeather.length - 1].normalRainfall * 7; // weekly normal

    const weatherInputs = {
      rainfallMm: avgRainfall,
      normalRainfall,
      temperatureC: avgTemp,
      normalTemperature: recentWeather[0].normalTemperature,
      ndvi: avgNdvi || null,
      historicalNdvi: 0.65, // typical healthy crop
      soilMoisture: avgSoilMoisture || null,
    };

    // Compute risk assessment
    const riskAssessment = computeCompositeRisk(weatherInputs, plot.cropType);

    // Check for trigger using insurance thresholds
    const thresholds = {
      rainfallDeviation: plot.insurance.rainfallDeviationThreshold,
      ndviDrop: plot.insurance.ndviDropThreshold,
      soilMoisture: plot.insurance.soilMoistureThreshold,
    };

    const triggerResult = detectTrigger(weatherInputs, plot.cropType, thresholds);

    let trigger = null;
    let payout = null;

    if (triggerResult && triggerResult.triggered) {
      // Check if a trigger already exists for this period
      const recentTrigger = await prisma.trigger.findFirst({
        where: {
          plotId,
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      });

      if (!recentTrigger) {
        // Create trigger record
        trigger = await prisma.trigger.create({
          data: {
            plotId,
            triggerType: triggerResult.triggerType,
            severity: triggerResult.severity,
            rainfallDeviation: riskAssessment.rainfallDeviation,
            ndviDrop: riskAssessment.ndviDrop,
            soilMoistureDeficit: riskAssessment.soilMoistureDeficit,
            thresholdCrossed: thresholds.rainfallDeviation,
            explanation: triggerResult.explanation,
            payoutPercentage: triggerResult.payoutPercentage,
          },
        });

        // Create payout record
        const payoutAmount = calculatePayout(plot.insurance.sumInsured, triggerResult);
        payout = await prisma.payout.create({
          data: {
            plotId,
            triggerId: trigger.id,
            payoutNumber: `PKV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            payoutAmount,
            payoutPercentage: triggerResult.payoutPercentage,
            calculationBasis: triggerResult.formulaBreakdown,
            baseAmount: plot.insurance.sumInsured,
            triggerSeverity: triggerResult.severity,
            multiplierApplied: triggerResult.payoutMultiplier,
            status: 'pending',
          },
        });
      }
    }

    res.json({
      plotId,
      weatherSummary: {
        avgRainfall: Math.round(avgRainfall * 10) / 10,
        normalRainfall: Math.round(normalRainfall * 10) / 10,
        avgTemp: Math.round(avgTemp * 10) / 10,
        avgNdvi: avgNdvi ? Math.round(avgNdvi * 1000) / 1000 : null,
        avgSoilMoisture: avgSoilMoisture ? Math.round(avgSoilMoisture * 10) / 10 : null,
      },
      riskAssessment,
      triggerResult,
      trigger,
      payout,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Monitoring failed', details: error.message });
  }
});

/**
 * GET /api/weather/:plotId - Get weather time series for a plot
 */
router.get('/weather/:plotId', async (req: Request, res: Response) => {
  try {
    const { plotId } = req.params;
    const limit = parseInt(req.query.limit as string) || 60;

    const weatherData = await prisma.weatherData.findMany({
      where: { plotId },
      orderBy: { date: 'asc' },
      take: limit,
    });

    res.json(weatherData);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch weather data', details: error.message });
  }
});

// Station listing is handled by phase2 router (/api/stations)

export default router;
