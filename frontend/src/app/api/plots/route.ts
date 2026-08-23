import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findNearestStation } from "@/lib/weatherService";

export async function GET() {
  try {
    const plots = await prisma.plot.findMany({
      include: { farmer: { select: { id: true, name: true } }, insurance: { select: { status: true, premiumAmount: true } } },
    });
    return NextResponse.json(plots);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch plots", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, areaHectares, coordinates, centerLat, centerLng, cropType, cropSeason, sowingDate, farmerId } = await req.json();
    if (!name || !areaHectares || !centerLat || !centerLng || !cropType || !cropSeason || !sowingDate || !farmerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const station = findNearestStation(centerLat, centerLng);
    const plot = await prisma.plot.create({
      data: {
        name, areaHectares: parseFloat(areaHectares), coordinates: JSON.stringify(coordinates || [[centerLat, centerLng]]),
        centerLat: parseFloat(centerLat), centerLng: parseFloat(centerLng), cropType, cropSeason,
        sowingDate: new Date(sowingDate), stationId: station.id, stationName: station.name, stationDist: station.distance, farmerId,
      },
      include: { farmer: true },
    });
    return NextResponse.json(plot, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to register plot", details: error.message }, { status: 500 });
  }
}
