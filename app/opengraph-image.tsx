import { ImageResponse } from "next/og";
import { weddingConfig } from "@/lib/config";

// Edge runtime is the supported path for ImageResponse (avoids the node
// font-path issue). Uses the config defaults for build-time reliability;
// edit lib/config.ts couple/date to change the share card.
export const runtime = "edge";
export const alt = "Wedding Invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph / Twitter card shown when the invitation link is shared
 * (WhatsApp, iMessage, etc.). Branded to the earth-tone palette. No font files
 * are bundled, so it uses the default sans — clean and reliable.
 */
export default function Image() {
  const { couple, date, location } = weddingConfig;

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
          background: "linear-gradient(150deg, #FBF6EA 0%, #F3EAD6 55%, #E4D2B0 100%)",
          color: "#3A2620"
        }}
      >
        {/* hairline gold frame */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: "1px solid rgba(185,138,94,0.6)",
            borderRadius: 24
          }}
        />

        {/* monogram */}
        <div
          style={{
            display: "flex",
            width: 132,
            height: 132,
            borderRadius: 66,
            border: "2px solid #B98A5E",
            alignItems: "center",
            justifyContent: "center",
            color: "#9A6A3C",
            fontSize: 46,
            letterSpacing: 2
          }}
        >
          {couple.initials}
        </div>

        <div
          style={{
            marginTop: 30,
            fontSize: 22,
            letterSpacing: 12,
            color: "#8A5A36",
            textTransform: "uppercase"
          }}
        >
          Together with their families
        </div>

        <div style={{ marginTop: 18, fontSize: 104, color: "#3A2620" }}>
          {couple.combined}
        </div>

        <div style={{ marginTop: 14, width: 140, height: 1, background: "#B98A5E" }} />

        <div
          style={{
            marginTop: 26,
            fontSize: 32,
            letterSpacing: 8,
            color: "#8A5A36",
            textTransform: "uppercase"
          }}
        >
          {date.display}
        </div>

        <div style={{ marginTop: 10, fontSize: 26, color: "#5A4636" }}>
          {location.primaryVenue}
        </div>
      </div>
    ),
    size
  );
}
