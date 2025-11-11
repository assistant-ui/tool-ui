import { NextConfig } from "next";
import createMDX from "@next/mdx";

const config: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async redirects() {
    return [
      {
        source: "/components",
        destination: "/docs/gallery",
        permanent: true,
      },
      {
        source: "/components/:path*",
        destination: "/docs/:path*",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(config);
