import { defineConfig } from "tsup";

const PKG = "packages/ndpr-toolkit/src";

export default defineConfig({
  entry: {
    index: `${PKG}/index.ts`,
    core: `${PKG}/core.ts`,
    hooks: `${PKG}/hooks-entry.ts`,
    consent: `${PKG}/consent.ts`,
    dsr: `${PKG}/dsr.ts`,
    dpia: `${PKG}/dpia.ts`,
    breach: `${PKG}/breach.ts`,
    policy: `${PKG}/policy.ts`,
    "lawful-basis": `${PKG}/lawful-basis-entry.ts`,
    "cross-border": `${PKG}/cross-border-entry.ts`,
    ropa: `${PKG}/ropa-entry.ts`,
    adapters: `${PKG}/adapters-entry.ts`,
    unstyled: "src/unstyled.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "jspdf",
    "@radix-ui/react-label",
    "@radix-ui/react-slot",
    "@radix-ui/react-switch",
    "@radix-ui/react-tabs",
    "lucide-react",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
  ],
  minify: true,
  treeshake: true,
  target: "es2015",
  outDir: "dist",
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
  onSuccess: async () => {
    const fs = await import("fs");
    const path = await import("path");

    const stylesDir = path.join("dist", "styles");
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }

    const animationsSource = path.join("src", "styles", "animations.css");
    const animationsDest = path.join("dist", "styles.css");

    if (fs.existsSync(animationsSource)) {
      fs.copyFileSync(animationsSource, animationsDest);
    }

    // Note: styles.d.ts is copied in the build:lib script after tsup completes,
    // because the DTS build step runs after onSuccess and would overwrite .d.ts files.
  },
});
