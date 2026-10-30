/** Instagram / Facebook / TikTok post links -> the iframe URL that plays them. Returns null for any other link. */
export function embedUrl(link?: string): string | null {
  let u: URL;
  try {
    u = new URL(String(link || "").trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www|m|web)\./, "");

  if (host === "instagram.com") {
    const m = u.pathname.match(/\/(reel|reels|p|tv)\/([\w-]+)/);
    return m ? `https://www.instagram.com/${m[1] === "reels" ? "reel" : m[1]}/${m[2]}/embed` : null;
  }
  if (host === "tiktok.com") {
    const m = u.pathname.match(/\/video\/(\d+)/);
    return m ? `https://www.tiktok.com/embed/v2/${m[1]}` : null;
  }
  if (host === "facebook.com" || host === "fb.watch") {
    const ok = host === "fb.watch" || /\/(reel|videos?|watch|share\/[rv])\b/.test(u.pathname);
    return ok ? `https://www.facebook.com/plugins/video.php?show_text=false&href=${encodeURIComponent(u.href)}` : null;
  }
  return null;
}
