import { env } from "@/env";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = env.NEXT_PUBLIC_AUDIO_BASE;
  if (!base) {
    return new Response(JSON.stringify({ error: "NEXT_PUBLIC_AUDIO_BASE is not set" }), { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const { blobs } = await list({ token: env.KS_READ_WRITE_TOKEN });

    const audio = blobs.filter((b) => /\.(mp3|wav|m4a|aac)$/i.test(b.pathname));

    const demos = audio
      .filter((b) => b.pathname.endsWith("(Demo).mp3") || /(\(|\s)Demo\)?\./i.test(b.pathname))
      .map((b) => ({ title: decodeURIComponent(b.pathname.replace(/^.*\//, "")), src: `${base.replace(/\/$/, "")}/${encodeURIComponent(b.pathname.replace(/^.*\//, ""))}` }));

    const completed = audio
      .filter((b) => !b.pathname.match(/(\(|\s)Demo\)?\./i))
      .map((b) => ({ title: decodeURIComponent(b.pathname.replace(/^.*\//, "")), src: `${base.replace(/\/$/, "")}/${encodeURIComponent(b.pathname.replace(/^.*\//, ""))}` }));

    return new Response(
      JSON.stringify({ demos, completed, count: { demos: demos.length, completed: completed.length } }),
      { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Failed to list blobs" }), { status: 500, headers: { "Cache-Control": "no-store" } });
  }
} 