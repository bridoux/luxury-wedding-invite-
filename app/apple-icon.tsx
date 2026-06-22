import { ImageResponse } from "next/og";
import { iconElement } from "@/lib/iconImage";

// iOS home-screen icon (iOS ignores SVG apple-touch-icons, so we render a PNG).
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(iconElement(180), size);
}
