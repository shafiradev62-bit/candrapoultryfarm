import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const getEnv = () => {
  const url = Deno.env.get("KV_REST_API_URL");
  const token = Deno.env.get("KV_REST_API_TOKEN");
  if (!url || !token) throw new Error("Missing KV_REST_API_URL or KV_REST_API_TOKEN");
  return { url, token };
};

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, key, data } = await req.json();
    const { url, token } = getEnv();

    if (action === "set") {
      const encoded = encodeURIComponent(JSON.stringify(data));
      const res = await fetch(`${url}/set/${encodeURIComponent(key)}/${encoded}`, {
        headers: headers(token),
      });
      const result = await res.json();
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get") {
      const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
        headers: headers(token),
      });
      const result = await res.json();
      let parsed = result?.result;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch { /* keep */ }
      }
      return new Response(JSON.stringify({ success: true, data: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "push_all") {
      // Use pipeline for batch SET
      const keys = Object.keys(data);
      const pipeline = keys.map((k) => ["SET", k, JSON.stringify(data[k])]);
      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { ...headers(token), "Content-Type": "application/json" },
        body: JSON.stringify(pipeline),
      });
      const result = await res.json();
      return new Response(JSON.stringify({ success: true, result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "pull_all") {
      const keysToFetch = data?.keys || ["warehouse", "daily_reports", "sales", "operational", "finance", "feed_formulas"];
      const pipeline = keysToFetch.map((k: string) => ["GET", k]);
      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { ...headers(token), "Content-Type": "application/json" },
        body: JSON.stringify(pipeline),
      });
      const result = await res.json();
      const parsed: Record<string, unknown> = {};
      if (Array.isArray(result)) {
        keysToFetch.forEach((k: string, i: number) => {
          let val = result[i]?.result;
          if (typeof val === "string") {
            try { val = JSON.parse(val); } catch { /* keep */ }
          }
          parsed[k] = val;
        });
      }
      return new Response(JSON.stringify({ success: true, data: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: set, get, push_all, pull_all" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("sync-redis error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
