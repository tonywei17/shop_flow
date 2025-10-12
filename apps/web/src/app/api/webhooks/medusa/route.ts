import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Medusa integration disabled" }, { status: 410 });
}
