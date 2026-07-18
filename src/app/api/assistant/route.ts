import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body.message || "";

    if (!message.trim()) {
      return NextResponse.json({ reply: "Please ask a question about TrustedNetworx solutions." }, { status: 400 });
    }

    // Graceful fallback — no LLM key needed for this pass
    return NextResponse.json({
      reply: "The TrustedNetworx AI Assistant is coming online soon. In the meantime, you can browse the Knowledge Base, check the Documentation, or reach out to your Partner Success Manager for immediate help. Common topics I'll cover: POTS replacement, hosted voice/UCaaS, wireless failover, and compliance lines (NFPA 72 / UL 864 — elevator, fire alarm, emergency phones).",
    });
  } catch {
    return NextResponse.json({ reply: "Something went wrong. Please try again." }, { status: 500 });
  }
}
