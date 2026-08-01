/// <reference types="vite/client" />

// Brings in Vite's declarations for asset-query imports, which is what makes
// `import toolkitStyles from "@tantainnovative/ndpr-toolkit/styles?url"` in
// root.tsx typecheck. Without it TypeScript sees the `?url` suffix as part of
// the module specifier and reports TS2307, even though Vite resolves it fine at
// build time — so `npx tsc --noEmit` failed here while `npm run build` passed.
