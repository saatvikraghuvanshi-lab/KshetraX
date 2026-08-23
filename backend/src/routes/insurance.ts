/**
 * Insurance & Payouts API Routes
 * 
 * Policy management, premium calculation, payout tracking
 */

import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { calculatePremium, computeCompositeRisk } from '../services/payoutEngine';
import { generateSyntheticWeather } from '../services/weatherService';

const router = Router();

/**
 * POST /api/insurance/create - Create insurance policy for a plot
 */
router.post('/insurance/create', async (req: Request, res: Response) => {
  try {
    const { plotId, startDate, endDate, rainfallThreshold = 30, ndviThreshold = 25, soilMoistureThreshold = 40 } = req.body;

    if (!plotId || !startDate || !endDate) {
      return res.status(400).json({ error: 'plotId, startDate, endDate are required' });
    }

    const plot = await prisma.plot.findUnique({ where: { id: plotId } });
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    // Check if plot already has active insurance
    const existing = await prisma.insurance.findFirst({
      where: { plotId, status: 'active' },
    });
    if (existing) {
      return res.status(409).json({ error: 'Plot already has active insurance' });
    }

    // Calculate risk score using historical weather data
    const weather = generateSyntheticWeather(
      new Date(), plot.centerLat, plot.centerLng, 'normal', plot.cropSeason
    );

    const risk = computeCompositeRisk(
      {
        rainfallMm: weather.rainfallMm,
        normalRainfall: weather.normalRainfall,
        temperatureC: weather.temperatureC,
        normalTemperature: weather.normalTemperature,
        ndvi: 0.65,
        historicalNdvi: 0.70,
        soilMoisture: weather.soilMoisture,
      },
      plot.cropType
    );

    // Calculate premium
    const { premium, premiumPerHectare } = calculatePremium(
      risk.compositeRisk,
      plot.areaHectares,
      plot.cropType
    );

    // Sum insured = expected crop value * area
    const cropConfig = require('../config').CROP_SENSITIVITY[plot.cropType] || require('../config').CROP_SENSITIVITY.rice;
    const sumInsured = cropConfig.baseYieldPerHa * cropConfig.pricePerKg * 1000 * plot.areaHectares;

    const policy = await prisma.insurance.create({
      data: {
        plotId,
        policyNumber: `PKV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        premiumAmount: premium,
        premiumPerHectare,
        sumInsured,
        riskScore: risk.compositeRisk,
        rainfallDeviationThreshold: rainfallThreshold,
        ndviDropThreshold: ndviThreshold,
        soilMoistureThreshold,
        status: 'active',
      },
    });

    res.status(201).json({
      policy,
      riskAssessment: risk,
      premiumBreakdown: {
        cropType: plot.cropType,
        areaHectares: plot.areaHectares,
        expectedYieldValue: sumInsured,
        riskScore: risk.compositeRisk,
        premium,
        premiumPerHectare,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create insurance', details: error.message });
  }
});

/**
 * GET /api/insurance/:plotId - Get insurance policy for a plot
 */
router.get('/insurance/:plotId', async (req: Request, res: Response) => {
  try {
    const policy = await prisma.insurance.findFirst({
      where: { plotId: req.params.plotId },
      include: { plot: { include: { farmer: true } } },
    });

    if (!policy) {
      return res.status(404).json({ error: 'No insurance found for this plot' });
    }

    res.json(policy);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch insurance', details: error.message });
  }
});

/**
 * GET /api/insurance - List all insurance policies
 */
router.get('/insurance', async (_req: Request, res: Response) => {
  try {
    const policies = await prisma.insurance.findMany({
      include: {
        plot: {
          select: { id: true, name: true, cropType: true, areaHectares: true },
        },
      },
    });
    res.json(policies);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch policies', details: error.message });
  }
});

/**
 * GET /api/payouts - List all payouts
 */
router.get('/payouts', async (_req: Request, res: Response) => {
  try {
    const payouts = await prisma.payout.findMany({
      include: {
        plot: { select: { id: true, name: true, cropType: true } },
        trigger: { select: { triggerType: true, severity: true, explanation: true } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(payouts);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch payouts', details: error.message });
  }
});

/**
 * GET /api/payouts/:id - Get payout details
 */
router.get('/payouts/:id', async (req: Request, res: Response) => {
  try {
    const payout = await prisma.payout.findUnique({
      where: { id: req.params.id },
      include: {
        plot: { include: { farmer: true } },
        trigger: true,
      },
    });

    if (!payout) {
      return res.status(404).json({ error: 'Payout not found' });
    }

    res.json(payout);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch payout', details: error.message });
  }
});

/**
 * PATCH /api/payouts/:id/disburse - Mark payout as disbursed
 */
router.patch('/payouts/:id/disburse', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.body;

    const payout = await prisma.payout.update({
      where: { id: req.params.id },
      data: {
        status: 'disbursed',
        disbursedAt: new Date(),
        transactionId: transactionId || `TXN-${Date.now()}`,
      },
    });

    // Also mark the trigger as acknowledged
    await prisma.trigger.update({
      where: { id: payout.triggerId },
      data: { status: 'paid', acknowledgedAt: new Date() },
    });

    res.json(payout);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to disburse payout', details: error.message });
  }
});

export default router;
