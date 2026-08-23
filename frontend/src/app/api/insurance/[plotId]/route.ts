import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { plotId: string } }) {
  try {
    const policy = await prisma.insurance.findFirst({ where: { plotId: params.plotId }, include: { plot: { include: { farmer: true } } } });
    if (!policy) return NextResponse.json({ error: "No insurance found for this plot" }, { status: 404 });
    return NextResponse.json(policy);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch insurance", details: error.message }, { status: 500 });
  }
}
