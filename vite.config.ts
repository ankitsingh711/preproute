import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import https from 'node:https'
import dns from 'node:dns'

const API_TARGET = 'https://admin-moderator-backend-staging.up.railway.app'

// Dev-only DNS fix: some networks fail to resolve this Railway subdomain via
// their default resolver (works fine via public DNS). Only affects local
// dev — the Vercel deployment's rewrite (see vercel.json) resolves normally.
const resolver = new dns.promises.Resolver()
resolver.setServers(['8.8.8.8', '1.1.1.1'])

const customLookup = (
  hostname: string,
  options: dns.LookupOptions,
  callback: (err: NodeJS.ErrnoException | null, address?: unknown, family?: number) => void,
) => {
  resolver
    .resolve4(hostname)
    .then((addresses) => {
      if (options.all) callback(null, addresses.map((address) => ({ address, family: 4 })))
      else callback(null, addresses[0], 4)
    })
    .catch(() => dns.lookup(hostname, options, callback as never))
}

const proxyAgent = new https.Agent({
  lookup: customLookup as unknown as https.AgentOptions['lookup'],
})

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      // Same-origin proxy so the browser never makes a cross-origin request —
      // the staging API's CORS allowlist doesn't include any dev/deployed origin.
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        agent: proxyAgent,
      },
    },
  },
})
