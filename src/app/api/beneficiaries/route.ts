import { NextResponse } from "next/server";
import { normalizeMooveHandle } from "@/lib/handles/normalize";
import { getStore, saveStore } from "@/lib/db/store";
import type { BeneficiaryAccount } from "@/lib/db/types";

export async function GET() {
  const store = await getStore();
  return NextResponse.json({
    beneficiaries: store.beneficiaries.map((b) => ({
      handle: b.handle,
      configured: Boolean(b.mooveApiKey.trim()),
    })),
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    handle?: string;
    mooveApiKey?: string;
  };
  const handle = body.handle ? normalizeMooveHandle(body.handle) : "";
  const mooveApiKey = body.mooveApiKey?.trim() ?? "";

  if (!handle) {
    return NextResponse.json({ error: "handle is required" }, { status: 422 });
  }
  if (!mooveApiKey) {
    return NextResponse.json(
      { error: "mooveApiKey is required" },
      { status: 422 },
    );
  }

  const store = await getStore();
  const existing = store.beneficiaries.find(
    (b) => normalizeMooveHandle(b.handle) === handle,
  );
  if (existing) {
    existing.mooveApiKey = mooveApiKey;
  } else {
    const row: BeneficiaryAccount = { handle, mooveApiKey };
    store.beneficiaries.push(row);
  }

  if (!store.policy.allowedHandles.map((h) => h.toLowerCase()).includes(handle)) {
    store.policy.allowedHandles.push(handle);
  }

  await saveStore(store);

  return NextResponse.json({
    beneficiaries: store.beneficiaries.map((b) => ({
      handle: b.handle,
      configured: true,
    })),
    policy: store.policy,
  });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const handle = url.searchParams.get("handle");
  if (!handle) {
    return NextResponse.json({ error: "handle query required" }, { status: 422 });
  }
  const normalized = normalizeMooveHandle(handle);
  const store = await getStore();
  store.beneficiaries = store.beneficiaries.filter(
    (b) => normalizeMooveHandle(b.handle) !== normalized,
  );
  await saveStore(store);
  return NextResponse.json({ ok: true });
}
