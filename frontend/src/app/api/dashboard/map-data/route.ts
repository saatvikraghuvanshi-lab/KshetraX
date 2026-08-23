import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const plots = await prisma.plot.findMany({
      include: { farmer: { select: { name: true } }, insurance: { select: { status: true, sumInsured: true, riskScore: true } }, triggers: { orderBy: { date: "desc" }, take: 1, select: { severity: true, date: true, triggerType: true } } },
    });
    const mapFeatures = plots.map(plot => ({
      id: plot.id, name: plot.name, centerLat: plot.centerLat, centerLng: plot.centerLng, cropType: plot.cropType, areaHectares: plot.areaHectares,
      farmerName: plot.farmer?.name || "Unknown", insurance: plot.insurance, latestTrigger: plot.triggers[0] || null,
      status: !plot.insurance ? "no_insurance" : plot.triggers.length > 0 && plot.triggers[0].severity === "severe" ? "triggered" : plot.triggers.length > 0 && plot.triggers[0].severity === "moderate" ? "near_trigger" : (plot.insurance?.riskScore || 0) > 50 ? "near_trigger" : "safe",
    }));
    return NextResponse.json(mapFeatures);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch map data", details: error.message }, { status: 500 });
  }
}
