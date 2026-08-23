import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const riskIndices = await prisma.riskIndex.findMany({ orderBy: { date: "asc" } });
    const monthlyTrends: Record<string, { avgComposite: number; avgRainfall: number; avgNdvi: number; avgSoil: number; count: number }> = {};
    for (const ri of riskIndices) {
      const monthKey = ri.date.toISOString().slice(0, 7);
      if (!monthlyTrends[monthKey]) monthlyTrends[monthKey] = { avgComposite: 0, avgRainfall: 0, avgNdvi: 0, avgSoil: 0, count: 0 };
      monthlyTrends[monthKey].avgComposite += ri.compositeScore; monthlyTrends[monthKey].avgRainfall += ri.rainfallRisk;
      monthlyTrends[monthKey].avgNdvi += ri.ndviRisk; monthlyTrends[monthKey].avgSoil += ri.soilMoistureRisk; monthlyTrends[monthKey].count++;
    }
    const trends = Object.entries(monthlyTrends).map(([month, data]) => ({
      month, avgCompositeRisk: Math.round(data.avgComposite / data.count * 100) / 100, avgRainfallRisk: Math.round(data.avgRainfall / data.count * 100) / 100,
      avgNdviRisk: Math.round(data.avgNdvi / data.count * 100) / 100, avgSoilMoistureRisk: Math.round(data.avgSoil / data.count * 100) / 100, dataPoints: data.count,
    }));
    return NextResponse.json(trends);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch risk trends", details: error.message }, { status: 500 });
  }
}
