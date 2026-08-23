import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { getSatelliteMetadata } from "@/lib/satelliteService";
import { findNearestStation } from "@/lib/weatherService";

export async function GET(_req: NextRequest, { params }: { params: { plotId: string } }) {
  try {
    const plot = await prisma.plot.findUnique({ where: { id: params.plotId } });
    if (!plot) return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    const metadata = await getSatelliteMetadata(plot.centerLat, plot.centerLng);
    const station = findNearestStation(plot.centerLat, plot.centerLng);
    return NextResponse.json({ plot: { id: plot.id, name: plot.name, lat: plot.centerLat, lng: plot.centerLng }, satellite: metadata, nearestStation: { id: station.id, name: station.name, distanceKm: station.distance, state: station.state }, dataSources: { ndvi: metadata.source === "unavailable" ? { status: "synthetic", description: "Using simulated NDVI (STAC API unavailable)" } : { status: "real", description: `Real Sentinel-2 NDVI from ${metadata.source}` }, weather: { status: "synthetic", description: "IMD-compatible synthetic weather data" }, soilMoisture: { status: "synthetic", description: "Simulated soil moisture (SMAP-compatible)" } } });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch satellite metadata", details: error.message }, { status: 500 });
  }
}
