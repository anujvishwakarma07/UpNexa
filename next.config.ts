// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   webpack(config) {
//     return config;
//   },
//   images: {
//     dangerouslyAllowSVG : true,
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**", // allow any host over https
//       },
//     ],
//   },
//   experimental : {
//     ppr: 'incremental'
//   },
//   devIndicators : {
//     appIsrStatus : true,
//     buildActivity: true,
//     buildActivityPosition: "bottom-right",
//   }
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow any host over https
      },
    ],
  },
  
  devIndicators: {
    position: "bottom-right", // updated property
  },
};

export default nextConfig;
