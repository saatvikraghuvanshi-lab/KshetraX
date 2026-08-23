import { NextResponse } from "next/server";
import { CROP_SENSITIVITY } from "@/lib/config";

export async function GET() {
  try {
    const crops = Object.entries(CROP_SENSITIVITY).map(([key, cfg]) => ({
      type: key, ...cfg,
      scenarios: [{ label: "Minor Drought", deviation: 25, expectedPayout: "25% of sum insured" }, { label: "Moderate Drought", deviation: 45, expectedPayout: "50% of sum insured" }, { label: "Severe Drought", deviation: 70, expectedPayout: "100% of sum insured" }],
    }));
    return NextResponse.json(crops);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch crop sensitivity", details: error.message }, { status: 500 });
  }
}
