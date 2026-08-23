import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CROP_SENSITIVITY } from "@/lib/config";

export async function GET(_req: NextRequest, { params }: { params: { plotId: string } }) {
  try {
    const plot = await prisma.plot.findUnique({ where: { id: params.plotId }, include: { yieldHistory: { orderBy: { year: "asc" } } } });
    if (!plot) return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    const yieldData = plot.yieldHistory;
    const cropConfig = CROP_SENSITIVITY[plot.cropType] || CROP_SENSITIVITY.rice;
    const avgYield = yieldData.reduce((s, y) => s + y.actualYield, 0) / yieldData.length;
    const avgRainfall = yieldData.reduce((s, y) => s + y.totalRainfall, 0) / yieldData.length;
    let numerator = 0, denomX = 0, denomY = 0;
    for (const y of yieldData) { const dx = y.totalRainfall - avgRainfall; const dy = y.actualYield - avgYield; numerator += dx * dy; denomX += dx * dx; denomY += dy * dy; }
    const correlation = denomX > 0 && denomY > 0 ? Math.round((numerator / Math.sqrt(denomX * denomY)) * 100) / 100 : 0;
    const droughtYears = yieldData.filter(y => y.droughtEvents > 0);
    const avgDroughtYieldLoss = droughtYears.length > 0 ? droughtYears.reduce((s, y) => s + y.yieldDeviation, 0) / droughtYears.length : 0;
    return NextResponse.json({ plot: { id: plot.id, name: plot.name, cropType: plot.cropType, areaHectares: plot.areaHectares }, cropSensitivity: { rainfallWeight: cropConfig.rainfallWeight, ndviWeight: cropConfig.ndviWeight, soilMoistureWeight: cropConfig.soilMoistureWeight, criticalStage: cropConfig.criticalStage, baseYieldPerHa: cropConfig.baseYieldPerHa, pricePerKg: cropConfig.pricePerKg }, yieldHistory: yieldData.map(y => ({ year: y.year, season: y.season, actualYield: y.actualYield, expectedYield: y.expectedYield, yieldDeviation: y.yieldDeviation, totalRainfall: y.totalRainfall, avgTemperature: y.avgTemperature, avgNdvi: y.avgNdvi, droughtEvents: y.droughtEvents })), correlation: { rainfallYieldCorrelation: correlation, avgYieldDeviation: Math.round(avgDroughtYieldLoss * 100) / 100, droughtYearsCount: droughtYears.length, totalYearsAnalyzed: yieldData.length } });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch yield history", details: error.message }, { status: 500 });
  }
}
