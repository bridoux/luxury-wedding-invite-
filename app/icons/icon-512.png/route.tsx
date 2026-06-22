import { ImageResponse } from "next/og";
import { iconElement } from "@/lib/iconImage";

export const runtime = "edge";

/** 512×512 PWA icon referenced by public/manifest.json. */
export function GET() {
  return new ImageResponse(iconElement(512), { width: 512, height: 512 });
}
