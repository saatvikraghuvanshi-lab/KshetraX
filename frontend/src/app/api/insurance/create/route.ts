import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { calculatePremium, computeCompositeRisk } from "@/lib/payoutEngine";
import { generateSyntheticWeather } from "@/lib/weatherService";
import { CROP_SENSITIVITY } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { plotId, startDate, endDate, rainfallThreshold = 30, ndviThreshold = 25, soilMoistureThreshold = 40 } = await req.json();
    if (!plotId || !startDate || !endDate) return NextResponse.json({ error: "plotId, startDate, endDate are required" }, { status: 400 });
    const plot = await prisma.plot.findUnique({ where: { id: plotId } });
    if (!plot) return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    const existing = await prisma.insurance.findFirst({ where: { plotId, status: "active" } });
    if (existing) return NextResponse.json({ error: "Plot already has active insurance" }, { status: 409 });
    const weather = generateSyntheticWeather(new Date(), plot.centerLat, plot.centerLng, "normal", plot.cropSeason);
    const risk = computeCompositeRisk({ rainfallMm: weather.rainfallMm, normalRainfall: weather.normalRainfall, temperatureC: weather.temperatureC, normalTemperature: weather.normalTemperature, ndvi: 0.65, historicalNdvi: 0.70, soilMoisture: weather.soilMoisture }, plot.cropType);
    const { premium, premiumPerHectare } = calculatePremium(risk.compositeRisk, plot.areaHectares, plot.cropType);
    const cropConfig = CROP_SENSITIVITY[plot.cropType] || CROP_SENSITIVITY.rice;
    const sumInsured = cropConfig.baseYieldPerHa * cropConfig.pricePerKg * 1000 * plot.areaHectares;
    const policy = await prisma.insurance.create({
      data: { plotId, policyNumber: `PKV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`, startDate: new Date(startDate), endDate: new Date(endDate), premiumAmount: premium, premiumPerHectare, sumInsured, riskScore: risk.compositeRisk, rainfallDeviationThreshold: rainfallThreshold, ndviDropThreshold: ndviThreshold, soilMoistureThreshold, status: "active" },
    });
    return NextResponse.json({ policy, riskAssessment: risk, premiumBreakdown: { cropType: plot.cropType, areaHectares: plot.areaHectares, expectedYieldValue: sumInsured, riskScore: risk.compositeRisk, premium, premiumPerHectare } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create insurance", details: error.message }, { status: 500 });
  }
}
