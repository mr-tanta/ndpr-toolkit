import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    unstyled: "src/unstyled.ts",
  },
  format: ["cjs", "esm"],
  dts: true, // Generate TypeScript declarations
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
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
    // Copy CSS files
    const fs = await import("fs");
    const path = await import("path");

    // Create styles directory
    const stylesDir = path.join("dist", "styles");
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }

    // Copy animation styles
    const animationsSource = path.join("src", "styles", "animations.css");
    const animationsDest = path.join("dist", "styles.css");

    if (fs.existsSync(animationsSource)) {
      fs.copyFileSync(animationsSource, animationsDest);
    }
  },
});
