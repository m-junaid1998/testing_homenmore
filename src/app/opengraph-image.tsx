import { ImageResponse } from "next/og";

export const alt = "BAMBOTIA - Online Jewellery Store in Pakistan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social previews (WhatsApp, Facebook, X) cannot read AVIF, so this renders a PNG brand card.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#08100d",
          color: "#c5a059",
        }}
      >
        <div style={{ fontSize: 120, letterSpacing: 24, fontWeight: 700 }}>BAMBOTIA</div>
        <div style={{ marginTop: 24, width: 160, height: 2, background: "#c5a059" }} />
        <div style={{ marginTop: 32, fontSize: 38, color: "#f4ede2" }}>Bridal Sets · Earrings · Bangles · Necklaces</div>
        <div style={{ marginTop: 16, fontSize: 28, color: "#a3b8ad" }}>Delivery across Pakistan</div>
      </div>
    ),
    size
  );
}
