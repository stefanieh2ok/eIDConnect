/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  experimental: {
    // DocuSign nutzt CommonJS intern (require('ApiClient') ohne ./),
    // daher nicht durch Webpack bündeln lassen – nur serverseitig laden.
    serverComponentsExternalPackages: ['docusign-esign'],
  },
  // Webpack-Cache in Development deaktivieren, um "Array buffer allocation failed"
  // und EPERM auf Windows zu vermeiden (weniger Speicher, keine Cache-Dateien).
  webpack: (config, { dev }) => {
    // IMPORTANT (Windows / low disk): disable persistent filesystem cache.
    // This prevents ENOSPC errors when Next/Webpack try to write *.pack files.
    // Trade-off: builds are a bit slower, but reliably complete.
    config.cache = false;
    return config;
  },
}

module.exports = nextConfig
