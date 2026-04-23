import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Transpile the toolkit so its JSX is compiled */
  transpilePackages: ["@tantainnovative/ndpr-toolkit"],
};

export default nextConfig;
