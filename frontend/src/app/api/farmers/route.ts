import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const farmers = await prisma.farmer.findMany({
      include: { plots: { select: { id: true, name: true, cropType: true } } },
    });
    return NextResponse.json(farmers);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch farmers', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, aadhaar, village, district, state } = await req.json();
    if (!name || !phone || !village || !district || !state) {
      return NextResponse.json({ error: 'Missing required fields: name, phone, village, district, state' }, { status: 400 });
    }
    const farmer = await prisma.farmer.create({
      data: { name, phone, email, aadhaar, village, district, state },
    });
    return NextResponse.json(farmer, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to register farmer', details: error.message }, { status: 500 });
  }
}
