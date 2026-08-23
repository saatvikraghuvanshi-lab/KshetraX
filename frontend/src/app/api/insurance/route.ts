import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const policies = await prisma.insurance.findMany({ include: { plot: { select: { id: true, name: true, cropType: true, areaHectares: true } } } });
    return NextResponse.json(policies);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch policies", details: error.message }, { status: 500 });
  }
}
