import { NextResponse } from "next/server";
import { mooveMockEnabled } from "@/lib/moove/client";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "homeward",
    mooveMock: mooveMockEnabled(),
    beneficiaryHandle: process.env.BENEFICIARY_HANDLE ?? null,
  });
}
