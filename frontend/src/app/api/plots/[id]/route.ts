import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plot = await prisma.plot.findUnique({
      where: { id: params.id },
      include: { farmer: true, insurance: true, weatherData: { orderBy: { date: "desc" }, take: 30 }, triggers: { orderBy: { date: "desc" } }, payouts: { orderBy: { date: "desc" } } },
    });
    if (!plot) return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    return NextResponse.json(plot);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch plot", details: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.payout.deleteMany({ where: { plotId: params.id } });
    await prisma.trigger.deleteMany({ where: { plotId: params.id } });
    await prisma.weatherData.deleteMany({ where: { plotId: params.id } });
    await prisma.insurance.deleteMany({ where: { plotId: params.id } });
    await prisma.plot.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Plot deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete plot", details: error.message }, { status: 500 });
  }
}
