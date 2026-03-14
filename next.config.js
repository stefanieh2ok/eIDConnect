/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Webpack-Cache in Development deaktivieren, um "Array buffer allocation failed"
  // und EPERM auf Windows zu vermeiden (weniger Speicher, keine Cache-Dateien).
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
}

module.exports = nextConfig
