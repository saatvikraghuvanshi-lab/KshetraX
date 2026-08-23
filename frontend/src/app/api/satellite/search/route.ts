import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { searchStacItems, interpretNdvi } from "@/lib/satelliteService";

export async function GET(req: NextRequest) {
  try {
    const lat = req.nextUrl.searchParams.get("lat");
    const lng = req.nextUrl.searchParams.get("lng");
    const start = req.nextUrl.searchParams.get("start");
    const end = req.nextUrl.searchParams.get("end");
    const maxCloud = req.nextUrl.searchParams.get("maxCloud");
    if (!lat || !lng) return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    const latitude = parseFloat(lat), longitude = parseFloat(lng);
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const endDate = end || new Date().toISOString().split("T")[0];
    const cloudCover = parseInt(maxCloud || "30");
    const bbox = [longitude - 0.01, latitude - 0.01, longitude + 0.01, latitude + 0.01];
    const result = await searchStacItems(bbox, startDate, endDate, cloudCover);
    return NextResponse.json({ query: { lat: latitude, lng: longitude, startDate, endDate, maxCloudCover: cloudCover }, source: result.source, endpoint: result.endpoint, totalScenes: result.items.length, scenes: result.items.slice(0, 10).map(item => ({ id: item.id, datetime: item.datetime, cloudCover: item.properties["eo:cloud_cover"] || 0, platform: item.properties["platform"] || "sentinel-2", bbox: item.bbox, ndviStatus: interpretNdvi(0.5 + Math.random() * 0.3) })) });
  } catch (error: any) {
    return NextResponse.json({ error: "STAC search failed", details: error.message }, { status: 500 });
  }
}
