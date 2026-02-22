const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const GOOGLE_APPS_SCRIPT_URL = Deno.env.get("GOOGLE_APPS_SCRIPT_URL");
  if (!GOOGLE_APPS_SCRIPT_URL) {
    return new Response(
      JSON.stringify({ error: "GOOGLE_APPS_SCRIPT_URL is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // PUSH: App → Google Sheets
    if (req.method === "POST" && action === "push") {
      const body = await req.json();
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "push", ...body }),
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      return new Response(JSON.stringify({ success: response.ok, data }), {
        status: response.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PULL: Google Sheets → App
    if (req.method === "GET" || (req.method === "POST" && action === "pull")) {
      const sheet = url.searchParams.get("sheet") || "all";
      const pullUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=pull&sheet=${encodeURIComponent(sheet)}`;
      const response = await fetch(pullUrl, { method: "GET" });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      return new Response(JSON.stringify({ success: response.ok, data }), {
        status: response.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RECEIVE: webhook from Google Sheets
    if (req.method === "POST" && action === "receive") {
      const body = await req.json();
      console.log("Received from Google Sheets:", JSON.stringify(body));
      return new Response(
        JSON.stringify({ success: true, message: "Data received", received: body }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Use ?action=push|pull|receive" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("syncsheets error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
