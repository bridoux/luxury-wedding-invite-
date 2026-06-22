"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { weddingConfig, type WeddingConfig } from "@/lib/config";
import { localizeConfig } from "@/lib/settingsService";
import { useLanguage } from "@/components/LanguageProvider";

/**
 * Provides the (possibly DB-overridden) wedding config to client components.
 * The value is resolved on the server in the root layout and passed down, so
 * SSR and the client first render match (no hydration mismatch) and edits made
 * in the admin show up on the public site.
 */
const WeddingConfigContext = createContext<WeddingConfig>(weddingConfig);

export function WeddingConfigProvider({
  value,
  children
}: {
  value: WeddingConfig;
  children: ReactNode;
}) {
  return (
    <WeddingConfigContext.Provider value={value}>
      {children}
    </WeddingConfigContext.Provider>
  );
}

/** Read the live wedding config (English prose as stored). */
export function useWeddingConfig(): WeddingConfig {
  return useContext(WeddingConfigContext);
}

/** Live config with prose localized to the active language (EN fallback). */
export function useLocalizedConfig(): WeddingConfig {
  const cfg = useContext(WeddingConfigContext);
  const { lang } = useLanguage();
  return useMemo(() => localizeConfig(cfg, lang), [cfg, lang]);
}
