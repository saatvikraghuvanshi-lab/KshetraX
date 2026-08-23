import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { transactionId } = await req.json();
    const payout = await prisma.payout.update({
      where: { id: params.id },
      data: { status: "disbursed", disbursedAt: new Date(), transactionId: transactionId || `TXN-${Date.now()}` },
    });
    await prisma.trigger.update({ where: { id: payout.triggerId }, data: { status: "paid", acknowledgedAt: new Date() } });
    return NextResponse.json(payout);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to disburse payout", details: error.message }, { status: 500 });
  }
}
