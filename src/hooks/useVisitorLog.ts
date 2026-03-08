import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Lightweight browser/OS parser ─────────────────────────────────────────────
function parseBrowser(ua: string): { browser: string; browser_version: string } {
  if (/Edg\//.test(ua))       return { browser: "Edge",    browser_version: ua.match(/Edg\/([\d.]+)/)?.[1] ?? "" };
  if (/OPR\//.test(ua))       return { browser: "Opera",   browser_version: ua.match(/OPR\/([\d.]+)/)?.[1] ?? "" };
  if (/Chrome\//.test(ua))    return { browser: "Chrome",  browser_version: ua.match(/Chrome\/([\d.]+)/)?.[1] ?? "" };
  if (/Firefox\//.test(ua))   return { browser: "Firefox", browser_version: ua.match(/Firefox\/([\d.]+)/)?.[1] ?? "" };
  if (/Safari\//.test(ua) && !/Chrome/.test(ua))
                               return { browser: "Safari",  browser_version: ua.match(/Version\/([\d.]+)/)?.[1] ?? "" };
  if (/MSIE|Trident/.test(ua)) return { browser: "IE",     browser_version: ua.match(/(?:MSIE |rv:)([\d.]+)/)?.[1] ?? "" };
  return { browser: "Unknown", browser_version: "" };
}

function parseOS(ua: string): { os: string; os_version: string } {
  if (/Windows NT/.test(ua)) {
    const v = ua.match(/Windows NT ([\d.]+)/)?.[1] ?? "";
    const map: Record<string, string> = { "10.0": "10/11", "6.3": "8.1", "6.2": "8", "6.1": "7" };
    return { os: "Windows", os_version: map[v] ?? v };
  }
  if (/Mac OS X/.test(ua))   return { os: "macOS",   os_version: ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, ".") ?? "" };
  if (/Android/.test(ua))    return { os: "Android", os_version: ua.match(/Android ([\d.]+)/)?.[1] ?? "" };
  if (/iPhone|iPad/.test(ua))return { os: "iOS",     os_version: ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, ".") ?? "" };
  if (/Linux/.test(ua))      return { os: "Linux",   os_version: "" };
  return { os: "Unknown", os_version: "" };
}

function detectDeviceType(ua: string): { device_type: string; is_mobile: boolean } {
  if (/iPad|Tablet/.test(ua)) return { device_type: "tablet", is_mobile: true };
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/.test(ua))
    return { device_type: "mobile", is_mobile: true };
  return { device_type: "desktop", is_mobile: false };
}

// Simple canvas-based fingerprint (no permission required)
async function buildFingerprint(): Promise<string> {
  const parts: string[] = [
    navigator.userAgent,
    navigator.language,
    String(screen.width) + "x" + String(screen.height),
    String(new Date().getTimezoneOffset()),
    String(navigator.hardwareConcurrency ?? 0),
  ];

  // Canvas entropy
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Ghost🔒", 2, 15);
      parts.push(canvas.toDataURL().slice(-32));
    }
  } catch (_) {}

  const str = parts.join("|");
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function useVisitorLog() {
  useEffect(() => {
    // Run only once per tab session
    const key = "vlog_" + window.location.pathname;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const run = async () => {
      const ua = navigator.userAgent;
      const { browser, browser_version } = parseBrowser(ua);
      const { os, os_version } = parseOS(ua);
      const { device_type, is_mobile } = detectDeviceType(ua);
      const fingerprint = await buildFingerprint();

      // Network connection (where available)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

      const payload = {
        user_agent:       ua,
        browser,
        browser_version,
        os,
        os_version,
        device_type,
        is_mobile,
        is_bot:           /bot|crawler|spider|crawling/i.test(ua),

        screen_width:   screen.width,
        screen_height:  screen.height,
        viewport_width: window.innerWidth,
        viewport_height:window.innerHeight,
        color_depth:    screen.colorDepth,
        pixel_ratio:    window.devicePixelRatio ?? 1,

        timezone:        Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezone_offset: new Date().getTimezoneOffset(),
        language:        navigator.language,
        languages:       Array.from(navigator.languages ?? []),

        page_url:   window.location.href,
        referrer:   document.referrer || null,

        connection_type:      conn?.effectiveType ?? conn?.type ?? null,
        hardware_concurrency: navigator.hardwareConcurrency ?? null,
        device_memory:        nav.deviceMemory ?? null,
        do_not_track:         navigator.doNotTrack ?? null,
        cookies_enabled:      navigator.cookieEnabled,
        fingerprint,
      };

      // Call edge function (fire-and-forget — never block the UI)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-visitor`,
          { method: "POST", headers, body: JSON.stringify(payload) }
        );
      } catch (_) { /* silently fail — never affect the visitor */ }
    };

    run();
  }, []);
}
