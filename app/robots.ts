import type { MetadataRoute } from "next";

// Private wedding invitation: disallow all crawlers across the whole site.
// The page-level robots meta tag (app/layout.tsx) is the real enforcement;
// this file makes the intent explicit for well-behaved bots.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/"
    }
  };
}
