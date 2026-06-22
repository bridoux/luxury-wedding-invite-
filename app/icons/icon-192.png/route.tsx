import { ImageResponse } from "next/og";
import { iconElement } from "@/lib/iconImage";

export const runtime = "edge";

/** 192×192 PWA icon referenced by public/manifest.json. */
export function GET() {
  return new ImageResponse(iconElement(192), { width: 192, height: 192 });
}
