import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const plots = await prisma.plot.groupBy({ by: ["cropType"], _count: true, _sum: { areaHectares: true } });
    const cropStats = await Promise.all(plots.map(async (crop) => {
      const triggers = await prisma.trigger.count({ where: { plot: { cropType: crop.cropType } } });
      const totalPayout = await prisma.payout.aggregate({ where: { plot: { cropType: crop.cropType }, status: "disbursed" }, _sum: { payoutAmount: true } });
      return { cropType: crop.cropType, plotCount: crop._count, totalArea: crop._sum.areaHectares || 0, triggerCount: triggers, totalPayoutDisbursed: totalPayout._sum.payoutAmount || 0 };
    }));
    return NextResponse.json(cropStats);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch crop summary", details: error.message }, { status: 500 });
  }
}
