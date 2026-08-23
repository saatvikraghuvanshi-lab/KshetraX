import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const payouts = await prisma.payout.findMany({
      include: { plot: { select: { id: true, name: true, cropType: true } }, trigger: { select: { triggerType: true, severity: true, explanation: true } } },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(payouts);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch payouts", details: error.message }, { status: 500 });
  }
}
