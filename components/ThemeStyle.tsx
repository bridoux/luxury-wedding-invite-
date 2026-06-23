import { themeCssText, type ThemeColors } from "@/lib/theme";

/**
 * Injects the admin-saved palette as CSS variables on :root, server-side, so the
 * themed colors are present on first paint (no flash). Output is digits/spaces
 * only (see lib/theme.ts), so inlining it is safe.
 */
export default function ThemeStyle({ theme }: { theme: ThemeColors }) {
  return <style id="theme-vars" dangerouslySetInnerHTML={{ __html: `:root{${themeCssText(theme)}}` }} />;
}
