import { NextResponse } from "next/server";
import { searchStacItems, fetchRealWeatherData, fetchSmapSoilMoisture } from "@/lib/satelliteService";

export async function GET() {
  try {
    const now = new Date(); const threeMonthsAgo = new Date(now); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const oneWeekAgo = new Date(now); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const testStartDate = threeMonthsAgo.toISOString().split("T")[0]; const testEndDate = now.toISOString().split("T")[0]; const weekStart = oneWeekAgo.toISOString().split("T")[0];
    let stacStatus = "unavailable"; try { const r = await searchStacItems([77.19, 28.60, 77.22, 28.62], testStartDate, testEndDate, 50); stacStatus = r.items.length > 0 ? "available" : "no_results"; } catch {}
    let weatherStatus = "unavailable"; try { const r = await fetchRealWeatherData(28.61, 77.21, weekStart, testEndDate); weatherStatus = r.length > 0 ? "available" : "no_results"; } catch {}
    let soilMoistureStatus = "unavailable"; try { const r = await fetchSmapSoilMoisture(28.61, 77.21, weekStart, testEndDate); soilMoistureStatus = r.length > 0 ? "available" : "no_results"; } catch {}
    return NextResponse.json({ satellite: { sentinel2: { status: stacStatus, provider: "Copernicus / element84 earth-search", resolution: "10m multispectral" }, landsat: { status: "available_via_stac", provider: "USGS/NASA via earth-search STAC" }, smap: { status: soilMoistureStatus, provider: "NASA SMAP / Open-Meteo" } }, weather: { imd: { status: "synthetic_imd_compatible", provider: "Synthetic (IMD-compatible seasonal normals)" }, openMeteo: { status: weatherStatus, provider: "Open-Meteo (free, no auth)" } }, geospatial: { openStreetMap: { status: "available" }, cadastralMaps: { status: "synthetic" } }, databases: { prisma: { status: "available" }, plotCoordinates: { status: "available" }, yieldHistory: { status: "available" } } });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to check data sources", details: error.message }, { status: 500 });
  }
}
