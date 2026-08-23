import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payout = await prisma.payout.findUnique({ where: { id: params.id }, include: { plot: { include: { farmer: true } }, trigger: true } });
    if (!payout) return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    return NextResponse.json(payout);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch payout", details: error.message }, { status: 500 });
  }
}
