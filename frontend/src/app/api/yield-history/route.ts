import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const yieldData = await prisma.yieldHistory.groupBy({ by: ["plotId"], _avg: { actualYield: true, yieldDeviation: true, totalRainfall: true }, _count: true });
    const summary = await Promise.all(yieldData.map(async (yd) => {
      const plot = await prisma.plot.findUnique({ where: { id: yd.plotId }, select: { id: true, name: true, cropType: true, areaHectares: true } });
      return { plot, avgYield: yd._avg.actualYield, avgDeviation: yd._avg.yieldDeviation, avgRainfall: yd._avg.totalRainfall, yearsOfData: yd._count };
    }));
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch yield summary", details: error.message }, { status: 500 });
  }
}
