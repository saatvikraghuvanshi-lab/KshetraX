import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { computeCompositeRisk, detectTrigger, calculatePayout } from "@/lib/payoutEngine";

export async function POST(req: NextRequest) {
  try {
    const { plotId } = await req.json();
    if (!plotId) return NextResponse.json({ error: "plotId is required" }, { status: 400 });
    const plot = await prisma.plot.findUnique({
      where: { id: plotId }, include: { insurance: true, weatherData: { orderBy: { date: "desc" }, take: 7 } },
    });
    if (!plot) return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    if (!plot.insurance) return NextResponse.json({ error: "Plot has no active insurance policy" }, { status: 400 });
    if (plot.weatherData.length === 0) return NextResponse.json({ error: "No weather data available. Generate data first." }, { status: 400 });
    const recentWeather = plot.weatherData;
    const avgRainfall = recentWeather.reduce((s, w) => s + w.rainfallMm, 0) / recentWeather.length;
    const avgTemp = recentWeather.reduce((s, w) => s + w.temperatureC, 0) / recentWeather.length;
    const avgNdvi = recentWeather.filter(w => w.ndvi !== null).reduce((s, w) => s + (w.ndvi || 0), 0) / Math.max(1, recentWeather.filter(w => w.ndvi !== null).length);
    const avgSoilMoisture = recentWeather.filter(w => w.soilMoisture !== null).reduce((s, w) => s + (w.soilMoisture || 0), 0) / Math.max(1, recentWeather.filter(w => w.soilMoisture !== null).length);
    const normalRainfall = recentWeather[recentWeather.length - 1].normalRainfall * 7;
    const weatherInputs = { rainfallMm: avgRainfall, normalRainfall, temperatureC: avgTemp, normalTemperature: recentWeather[0].normalTemperature, ndvi: avgNdvi || null, historicalNdvi: 0.65, soilMoisture: avgSoilMoisture || null };
    const riskAssessment = computeCompositeRisk(weatherInputs, plot.cropType);
    const thresholds = { rainfallDeviation: plot.insurance.rainfallDeviationThreshold, ndviDrop: plot.insurance.ndviDropThreshold, soilMoisture: plot.insurance.soilMoistureThreshold };
    const triggerResult = detectTrigger(weatherInputs, plot.cropType, thresholds);
    let trigger = null, payout = null;
    if (triggerResult && triggerResult.triggered) {
      const recentTrigger = await prisma.trigger.findFirst({ where: { plotId, date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } });
      if (!recentTrigger) {
        trigger = await prisma.trigger.create({
          data: { plotId, triggerType: triggerResult.triggerType, severity: triggerResult.severity, rainfallDeviation: riskAssessment.rainfallDeviation, ndviDrop: riskAssessment.ndviDrop, soilMoistureDeficit: riskAssessment.soilMoistureDeficit, thresholdCrossed: thresholds.rainfallDeviation, explanation: triggerResult.explanation, payoutPercentage: triggerResult.payoutPercentage },
        });
        const payoutAmount = calculatePayout(plot.insurance.sumInsured, triggerResult);
        payout = await prisma.payout.create({
          data: { plotId, triggerId: trigger.id, payoutNumber: `PKV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, payoutAmount, payoutPercentage: triggerResult.payoutPercentage, calculationBasis: triggerResult.formulaBreakdown, baseAmount: plot.insurance.sumInsured, triggerSeverity: triggerResult.severity, multiplierApplied: triggerResult.payoutMultiplier, status: "pending" },
        });
      }
    }
    return NextResponse.json({ plotId, weatherSummary: { avgRainfall: Math.round(avgRainfall * 10) / 10, normalRainfall: Math.round(normalRainfall * 10) / 10, avgTemp: Math.round(avgTemp * 10) / 10, avgNdvi: avgNdvi ? Math.round(avgNdvi * 1000) / 1000 : null, avgSoilMoisture: avgSoilMoisture ? Math.round(avgSoilMoisture * 10) / 10 : null }, riskAssessment, triggerResult, trigger, payout });
  } catch (error: any) {
    return NextResponse.json({ error: "Monitoring failed", details: error.message }, { status: 500 });
  }
}
