import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { fetchRealWeatherData, fetchSmapSoilMoisture } from "@/lib/satelliteService";

export async function POST(req: NextRequest) {
  try {
    const { plotId, days = 30 } = await req.json();
    if (!plotId) return NextResponse.json({ error: "plotId is required" }, { status: 400 });
    const plot = await prisma.plot.findUnique({ where: { id: plotId } });
    if (!plot) return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const realWeather = await fetchRealWeatherData(plot.centerLat, plot.centerLng, startDate, endDate);
    const realSoilMoisture = await fetchSmapSoilMoisture(plot.centerLat, plot.centerLng, startDate, endDate);
    return NextResponse.json({ plotId: plot.id, plotName: plot.name, period: { start: startDate, end: endDate }, weather: { source: realWeather.length > 0 ? "Open-Meteo" : "unavailable", dataPoints: realWeather.length, sample: realWeather.slice(0, 5) }, soilMoisture: { source: realSoilMoisture.length > 0 ? "Open-Meteo (SMAP-compatible)" : "unavailable", dataPoints: realSoilMoisture.length, sample: realSoilMoisture.slice(0, 5) } });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch real weather data", details: error.message }, { status: 500 });
  }
}
