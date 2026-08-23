import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { plotId: string } }) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "60");
    const weatherData = await prisma.weatherData.findMany({ where: { plotId: params.plotId }, orderBy: { date: "asc" }, take: limit });
    return NextResponse.json(weatherData);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch weather data", details: error.message }, { status: 500 });
  }
}
