/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ffmpeg.wasm is loaded lazily in the browser only; keep it out of the server graph.
  serverExternalPackages: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

export default nextConfig
