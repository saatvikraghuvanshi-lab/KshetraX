/**
 * Dashboard API Routes
 * 
 * Summary stats, analytics, transparency data
 */

import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

/**
 * GET /api/dashboard/stats - Get overall system statistics
 */
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [
      totalFarmers,
      totalPlots,
      activePolicies,
      totalTriggers,
      pendingPayouts,
      disbursedPayouts,
      totalPayoutAmount,
      totalAreaInsured,
    ] = await Promise.all([
      prisma.farmer.count(),
      prisma.plot.count(),
      prisma.insurance.count({ where: { status: 'active' } }),
      prisma.trigger.count(),
      prisma.payout.count({ where: { status: 'pending' } }),
      prisma.payout.count({ where: { status: 'disbursed' } }),
      prisma.payout.aggregate({ _sum: { payoutAmount: true }, where: { status: 'disbursed' } }),
      prisma.plot.aggregate({ _sum: { areaHectares: true } }),
    ]);

    res.json({
      totalFarmers,
      totalPlots,
      activePolicies,
      totalTriggers,
      pendingPayouts,
      disbursedPayouts,
      totalPayoutAmount: totalPayoutAmount._sum.payoutAmount || 0,
      totalAreaInsured: totalAreaInsured._sum.areaHectares || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

/**
 * GET /api/dashboard/recent-activity - Get recent triggers and payouts
 */
router.get('/recent-activity', async (_req: Request, res: Response) => {
  try {
    const [recentTriggers, recentPayouts] = await Promise.all([
      prisma.trigger.findMany({
        orderBy: { date: 'desc' },
        take: 10,
        include: {
          plot: {
            select: { id: true, name: true, cropType: true },
          },
        },
      }),
      prisma.payout.findMany({
        orderBy: { date: 'desc' },
        take: 10,
        include: {
          plot: {
            select: { id: true, name: true, cropType: true },
          },
          trigger: {
            select: { severity: true, explanation: true },
          },
        },
      }),
    ]);

    res.json({ recentTriggers, recentPayouts });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch activity', details: error.message });
  }
});

/**
 * GET /api/dashboard/map-data - Get all plots with their status for map display
 */
router.get('/map-data', async (_req: Request, res: Response) => {
  try {
    const plots = await prisma.plot.findMany({
      include: {
        farmer: { select: { name: true } },
        insurance: { select: { status: true, sumInsured: true, riskScore: true } },
        triggers: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { severity: true, date: true, triggerType: true },
        },
      },
    });

    const mapFeatures = plots.map(plot => ({
      id: plot.id,
      name: plot.name,
      centerLat: plot.centerLat,
      centerLng: plot.centerLng,
      cropType: plot.cropType,
      areaHectares: plot.areaHectares,
      farmerName: plot.farmer?.name || 'Unknown',
      insurance: plot.insurance,
      latestTrigger: plot.triggers[0] || null,
      status: !plot.insurance ? 'no_insurance'
        : plot.triggers.length > 0 && plot.triggers[0].severity === 'severe' ? 'triggered'
        : plot.triggers.length > 0 && plot.triggers[0].severity === 'moderate' ? 'near_trigger'
        : plot.insurance.riskScore > 50 ? 'near_trigger'
        : 'safe',
    }));

    res.json(mapFeatures);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch map data', details: error.message });
  }
});

/**
 * GET /api/dashboard/crop-summary - Get summary by crop type
 */
router.get('/crop-summary', async (_req: Request, res: Response) => {
  try {
    const plots = await prisma.plot.groupBy({
      by: ['cropType'],
      _count: true,
      _sum: { areaHectares: true },
    });

    const cropStats = await Promise.all(
      plots.map(async (crop) => {
        const triggers = await prisma.trigger.count({
          where: {
            plot: { cropType: crop.cropType },
          },
        });

        const totalPayout = await prisma.payout.aggregate({
          where: {
            plot: { cropType: crop.cropType },
            status: 'disbursed',
          },
          _sum: { payoutAmount: true },
        });

        return {
          cropType: crop.cropType,
          plotCount: crop._count,
          totalArea: crop._sum.areaHectares || 0,
          triggerCount: triggers,
          totalPayoutDisbursed: totalPayout._sum.payoutAmount || 0,
        };
      })
    );

    res.json(cropStats);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch crop summary', details: error.message });
  }
});

export default router;
