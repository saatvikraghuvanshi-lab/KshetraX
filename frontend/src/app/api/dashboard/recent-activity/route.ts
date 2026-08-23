import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [recentTriggers, recentPayouts] = await Promise.all([
      prisma.trigger.findMany({ orderBy: { date: "desc" }, take: 10, include: { plot: { select: { id: true, name: true, cropType: true } } } }),
      prisma.payout.findMany({ orderBy: { date: "desc" }, take: 10, include: { plot: { select: { id: true, name: true, cropType: true } }, trigger: { select: { severity: true, explanation: true } } } }),
    ]);
    return NextResponse.json({ recentTriggers, recentPayouts });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch activity", details: error.message }, { status: 500 });
  }
}
