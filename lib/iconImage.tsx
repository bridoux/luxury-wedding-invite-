import { weddingConfig } from "@/lib/config";

/**
 * Shared monogram artwork for the PWA / favicon / apple-touch icons.
 * Rendered to PNG by next/og. The warm gradient fills the whole square so it
 * stays safe as a maskable icon (no transparent corners).
 */
export function iconElement(size: number) {
  const ring = Math.round(size * 0.82);
  const monogram = `${weddingConfig.couple.partnerOne[0]}&${weddingConfig.couple.partnerTwo[0]}`;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(150deg, #F3EAD6 0%, #D7AA7E 100%)"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: ring,
          height: ring,
          borderRadius: ring,
          border: `${Math.max(2, Math.round(size * 0.028))}px solid #8A5A36`,
          color: "#5C3922",
          fontSize: Math.round(size * 0.34),
          fontWeight: 600
        }}
      >
        {monogram}
      </div>
    </div>
  );
}
