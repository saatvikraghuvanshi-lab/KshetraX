import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { WEATHER_STATIONS } from "@/lib/weatherService";

export async function GET(req: NextRequest) {
  try {
    const lat = req.nextUrl.searchParams.get("lat");
    const lng = req.nextUrl.searchParams.get("lng");
    if (lat && lng) {
      const allStations = WEATHER_STATIONS.map(station => {
        const dist = Math.sqrt(Math.pow(station.lat - parseFloat(lat), 2) + Math.pow(station.lng - parseFloat(lng), 2));
        return { ...station, distanceKm: Math.round(dist * 111) };
      }).sort((a, b) => a.distanceKm - b.distanceKm);
      return NextResponse.json({ nearest: allStations[0], backup: allStations.slice(1, 4), all: allStations });
    }
    return NextResponse.json({ stations: WEATHER_STATIONS });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch stations", details: error.message }, { status: 500 });
  }
}
