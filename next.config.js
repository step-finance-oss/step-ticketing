/* eslint-disable @typescript-eslint/no-var-requires */
const {
  getCSP,
  SELF,
  UNSAFE_INLINE,
  UNSAFE_EVAL,
  NONE,
  DATA,
  UNSAFE_HASHES,
  BLOB
} = require('csp-header')
const { clusterApiUrl } = require("@solana/web3.js");

function getCSPHeader() {
  const isDev = process.env.NODE_ENV === 'development'

  const DOMAIN_VERCEL = "https://vercel.live"
  const DOMAIN_GOOGLE_FONTS = "https://fonts.googleapis.com"
  const DOMAIN_GOOGLE_FONTS_STATIC = "https://fonts.gstatic.com"
  const DOMAIN_SQUARESPACE = "https://images.squarespace-cdn.com"
  const DOMAIN_TYPEKIT = "https://use.typekit.net"
  const DOMAIN_P_TYPEKIT = "https://p.typekit.net"
  const KADO_API = process.env.NEXT_PUBLIC_KADO_API_URL
  const KADO_FRONTEND = process.env.NEXT_PUBLIC_KADO_FRONTEND_URL
  const DOMAIN_SOLANA_ENDPOINT = process.env.NEXT_PUBLIC_CLUSTER_ENDPOINT || clusterApiUrl("devnet")
  const DOMAIN_SOLANA_ENDPOINT_WSS = DOMAIN_SOLANA_ENDPOINT.replace(/^http/, "ws")
  const scriptSrc = [
    SELF,
    UNSAFE_INLINE,
    DOMAIN_VERCEL,
  ]
  const styleSrc = [SELF, DOMAIN_VERCEL, DOMAIN_GOOGLE_FONTS, DOMAIN_TYPEKIT, DOMAIN_P_TYPEKIT, UNSAFE_INLINE]
  if (isDev) {
    scriptSrc.push(UNSAFE_EVAL)
    styleSrc.push(UNSAFE_HASHES)
  }

  return getCSP({
    directives: {
      'connect-src': [
        SELF,
        DOMAIN_VERCEL,
        KADO_API,
        KADO_FRONTEND,
        DOMAIN_SOLANA_ENDPOINT,
        DOMAIN_SOLANA_ENDPOINT_WSS,
      ],
      'default-src': [NONE],
      'font-src': [SELF, DOMAIN_GOOGLE_FONTS, DOMAIN_GOOGLE_FONTS_STATIC, DOMAIN_VERCEL, DOMAIN_TYPEKIT],
      'frame-src': [SELF, DOMAIN_VERCEL],
      'img-src': [SELF, DATA, DOMAIN_SQUARESPACE],
      'script-src': scriptSrc,
      'style-src': styleSrc,
      'worker-src': [SELF, BLOB],
      'base-uri': [SELF],
      'upgrade-insecure-requests': !isDev,
    },
  })
}

module.exports = {
  env: {
    FONT_LINKS: process.env.FONT_LINKS,
    FAVICON: process.env.FAVICON,
  },
  webpack: (config) => {
    config.externals.push("pino-pretty")
    return config
  },
  async headers() {
    const cspHeader = getCSPHeader()
    const headers = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Content-Security-Policy',
        value: cspHeader,
      },
      {
        key: 'X-XSS-Protection',
        value: '0',
      }
    ]

    return [
      {
        source: '/(.*)',
        headers: headers,
      },
    ]
  },
}
