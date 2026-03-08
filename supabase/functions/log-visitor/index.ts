import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const body = await req.json();

    // ── Extract real IP from headers (Cloudflare / nginx / Deno Deploy) ──────
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-client-ip") ||
      "unknown";

    // ── Collect all useful request headers ────────────────────────────────────
    const rawHeaders: Record<string, string> = {};
    req.headers.forEach((v, k) => { rawHeaders[k] = v; });

    // ── Geo lookup via ip-api.com (free, no key needed) ───────────────────────
    let geo: Record<string, string> = {};
    if (ip !== "unknown" && ip !== "127.0.0.1" && ip !== "::1") {
      try {
        const geoRes = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,as`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            geo = {
              country: geoData.country ?? "",
              country_code: geoData.countryCode ?? "",
              region: geoData.regionName ?? "",
              city: geoData.city ?? "",
              isp: geoData.isp ?? "",
              asn: geoData.as ?? "",
            };
          }
        }
      } catch (_) { /* geo lookup failed, continue without it */ }
    }

    // ── Parse UTM params from page_url ────────────────────────────────────────
    let utm_source = "", utm_medium = "", utm_campaign = "";
    try {
      const url = new URL(body.page_url || "");
      utm_source   = url.searchParams.get("utm_source")   || "";
      utm_medium   = url.searchParams.get("utm_medium")   || "";
      utm_campaign = url.searchParams.get("utm_campaign") || "";
    } catch (_) {}

    // ── Write to Supabase ─────────────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("visitor_logs").insert({
      ip_address: ip,
      country:        geo.country        || null,
      country_code:   geo.country_code   || null,
      region:         geo.region         || null,
      city:           geo.city           || null,
      isp:            geo.isp            || null,
      asn:            geo.asn            || null,

      user_agent:       body.user_agent       || null,
      browser:          body.browser          || null,
      browser_version:  body.browser_version  || null,
      os:               body.os               || null,
      os_version:       body.os_version       || null,
      device_type:      body.device_type      || null,
      is_mobile:        body.is_mobile        ?? false,
      is_bot:           body.is_bot           ?? false,

      screen_width:   body.screen_width   || null,
      screen_height:  body.screen_height  || null,
      viewport_width: body.viewport_width || null,
      viewport_height:body.viewport_height|| null,
      color_depth:    body.color_depth    || null,
      pixel_ratio:    body.pixel_ratio    || null,

      timezone:        body.timezone        || null,
      timezone_offset: body.timezone_offset ?? null,
      language:        body.language        || null,
      languages:       body.languages       || null,

      page_url:  body.page_url  || null,
      referrer:  body.referrer  || null,
      utm_source:   utm_source   || null,
      utm_medium:   utm_medium   || null,
      utm_campaign: utm_campaign || null,

      connection_type:      body.connection_type      || null,
      hardware_concurrency: body.hardware_concurrency || null,
      device_memory:        body.device_memory        || null,
      do_not_track:         body.do_not_track         || null,
      cookies_enabled:      body.cookies_enabled      ?? true,
      fingerprint:          body.fingerprint          || null,
      raw_headers:          rawHeaders,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("log-visitor error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
