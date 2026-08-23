import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateWeatherTimeSeries } from "@/lib/weatherService";
import { generateSyntheticNdviTimeSeries } from "@/lib/satelliteService";

export async function POST(req: NextRequest) {
  try {
    const { plotId, days = 60, scenario = "normal" } = await req.json();
    if (!plotId) return NextResponse.json({ error: "plotId is required" }, { status: 400 });
    const plot = await prisma.plot.findUnique({ where: { id: plotId } });
    if (!plot) return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    const startDate = new Date(plot.sowingDate);
    const weatherData = generateWeatherTimeSeries(startDate, days, plot.centerLat, plot.centerLng, scenario as any, plot.cropSeason);
    const ndviData = generateSyntheticNdviTimeSeries(startDate, days, plot.cropType, scenario !== "normal");
    await prisma.weatherData.deleteMany({ where: { plotId } });
    const created = await Promise.all(
      weatherData.map(async (w, i) => {
        const ndviPoint = ndviData[i];
        return prisma.weatherData.create({
          data: {
            plotId, date: w.date, rainfallMm: w.rainfallMm, temperatureC: w.temperatureC, humidity: w.humidity,
            soilMoisture: w.soilMoisture, windSpeed: w.windSpeed, normalRainfall: w.normalRainfall, normalTemperature: w.normalTemperature,
            rainfallDeviation: ((w.normalRainfall - w.rainfallMm) / w.normalRainfall) * 100,
            ndvi: ndviPoint?.ndvi ?? null, ndviAnomaly: null, source: w.source,
          },
        });
      })
    );
    if (created.length > 10) {
      const earlyNdvi = created.slice(0, 10).filter(d => d.ndvi !== null).reduce((sum, d) => sum + (d.ndvi || 0), 0) / 10;
      for (const point of created) {
        if (point.ndvi !== null) {
          const anomaly = ((point.ndvi - earlyNdvi) / earlyNdvi) * 100;
          await prisma.weatherData.update({ where: { id: point.id }, data: { ndviAnomaly: anomaly } });
        }
      }
    }
    return NextResponse.json({ message: `Generated ${created.length} weather data points`, scenario, plotId });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to generate weather data", details: error.message }, { status: 500 });
  }
}
