/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Suppress HMR WebSocket warnings
  experimental: {
    turbo: {
      resolveAlias: {
        // Suppress module resolution warnings
      }
    }
  },
  
  // Better logging configuration
  logging: {
    fetches: {
      fullUrl: false
    }
  },
  
  // Webpack configuration to suppress warnings
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.next']
      }
    }
    return config
  }
}

export default nextConfig
