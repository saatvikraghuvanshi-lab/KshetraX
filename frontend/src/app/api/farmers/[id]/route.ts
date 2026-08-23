import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: { id: params.id },
      include: { plots: { include: { insurance: true, triggers: { orderBy: { date: "desc" }, take: 5 }, payouts: { orderBy: { date: "desc" }, take: 5 } } } },
    });
    if (!farmer) return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    return NextResponse.json(farmer);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch farmer", details: error.message }, { status: 500 });
  }
}
