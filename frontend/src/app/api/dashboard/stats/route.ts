import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [totalFarmers, totalPlots, activePolicies, totalTriggers, pendingPayouts, disbursedPayouts, totalPayoutAmount, totalAreaInsured] = await Promise.all([
      prisma.farmer.count(), prisma.plot.count(),
      prisma.insurance.count({ where: { status: "active" } }), prisma.trigger.count(),
      prisma.payout.count({ where: { status: "pending" } }), prisma.payout.count({ where: { status: "disbursed" } }),
      prisma.payout.aggregate({ _sum: { payoutAmount: true }, where: { status: "disbursed" } }),
      prisma.plot.aggregate({ _sum: { areaHectares: true } }),
    ]);
    return NextResponse.json({ totalFarmers, totalPlots, activePolicies, totalTriggers, pendingPayouts, disbursedPayouts, totalPayoutAmount: totalPayoutAmount._sum.payoutAmount || 0, totalAreaInsured: totalAreaInsured._sum.areaHectares || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch stats", details: error.message }, { status: 500 });
  }
}
