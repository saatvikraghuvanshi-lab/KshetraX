/**
 * Plots API Routes
 * 
 * CRUD for farmer registration and plot management
 */

import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { findNearestStation } from '../services/weatherService';

const router = Router();

/**
 * POST /api/farmers - Register a new farmer
 */
router.post('/farmers', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, aadhaar, village, district, state } = req.body;

    if (!name || !phone || !village || !district || !state) {
      return res.status(400).json({ error: 'Missing required fields: name, phone, village, district, state' });
    }

    const farmer = await prisma.farmer.create({
      data: { name, phone, email, aadhaar, village, district, state },
    });

    res.status(201).json(farmer);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Phone number already registered' });
    }
    res.status(500).json({ error: 'Failed to register farmer', details: error.message });
  }
});

/**
 * GET /api/farmers - List all farmers
 */
router.get('/farmers', async (_req: Request, res: Response) => {
  try {
    const farmers = await prisma.farmer.findMany({
      include: { plots: { select: { id: true, name: true, cropType: true } } },
    });
    res.json(farmers);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch farmers', details: error.message });
  }
});

/**
 * GET /api/farmers/:id - Get farmer details
 */
router.get('/farmers/:id', async (req: Request, res: Response) => {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { id: req.params.id },
      include: {
        plots: {
          include: {
            insurance: true,
            triggers: { orderBy: { date: 'desc' }, take: 5 },
            payouts: { orderBy: { date: 'desc' }, take: 5 },
          },
        },
      },
    });

    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json(farmer);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch farmer', details: error.message });
  }
});

/**
 * POST /api/plots - Register a new plot
 */
router.post('/plots', async (req: Request, res: Response) => {
  try {
    const {
      name, areaHectares, coordinates, centerLat, centerLng,
      cropType, cropSeason, sowingDate, farmerId
    } = req.body;

    if (!name || !areaHectares || !centerLat || !centerLng || !cropType || !cropSeason || !sowingDate || !farmerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find nearest weather station
    const station = findNearestStation(centerLat, centerLng);

    const plot = await prisma.plot.create({
      data: {
        name,
        areaHectares: parseFloat(areaHectares),
        coordinates: JSON.stringify(coordinates || [[centerLat, centerLng]]),
        centerLat: parseFloat(centerLat),
        centerLng: parseFloat(centerLng),
        cropType,
        cropSeason,
        sowingDate: new Date(sowingDate),
        stationId: station.id,
        stationName: station.name,
        stationDist: station.distance,
        farmerId,
      },
      include: { farmer: true },
    });

    res.status(201).json(plot);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to register plot', details: error.message });
  }
});

/**
 * GET /api/plots - List all plots
 */
router.get('/plots', async (_req: Request, res: Response) => {
  try {
    const plots = await prisma.plot.findMany({
      include: {
        farmer: { select: { id: true, name: true } },
        insurance: { select: { status: true, premiumAmount: true } },
      },
    });
    res.json(plots);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch plots', details: error.message });
  }
});

/**
 * GET /api/plots/:id - Get plot details with full data
 */
router.get('/plots/:id', async (req: Request, res: Response) => {
  try {
    const plot = await prisma.plot.findUnique({
      where: { id: req.params.id },
      include: {
        farmer: true,
        insurance: true,
        weatherData: { orderBy: { date: 'desc' }, take: 30 },
        triggers: { orderBy: { date: 'desc' } },
        payouts: { orderBy: { date: 'desc' } },
      },
    });

    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }

    res.json(plot);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch plot', details: error.message });
  }
});

/**
 * DELETE /api/plots/:id - Delete a plot
 */
router.delete('/plots/:id', async (req: Request, res: Response) => {
  try {
    // Delete related records first
    await prisma.payout.deleteMany({ where: { plotId: req.params.id } });
    await prisma.trigger.deleteMany({ where: { plotId: req.params.id } });
    await prisma.weatherData.deleteMany({ where: { plotId: req.params.id } });
    await prisma.insurance.deleteMany({ where: { plotId: req.params.id } });

    await prisma.plot.delete({ where: { id: req.params.id } });

    res.json({ message: 'Plot deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete plot', details: error.message });
  }
});

export default router;
