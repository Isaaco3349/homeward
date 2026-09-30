import { NextResponse } from "next/server";
import { getStore } from "@/lib/db/store";

export async function GET() {
  const store = await getStore();
  return NextResponse.json({
    plans: store.plans,
    schedules: store.schedules,
  });
}
