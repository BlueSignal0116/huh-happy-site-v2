import { getStore } from "@netlify/blobs";

const STORE_NAME = "catmemecoin0130";
const KEY = "huh_button_total";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const op = url.searchParams.get("op") || "get";

    const store = getStore({ name: STORE_NAME, consistency: "strong" });

    const raw = await store.get(KEY);
    let current = raw ? Number(raw) : 0;
    if (!Number.isFinite(current)) current = 0;

    if (op === "hit") {
      current += 1;
      await store.set(KEY, String(current));
    }

    return new Response(JSON.stringify({ value: current }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
