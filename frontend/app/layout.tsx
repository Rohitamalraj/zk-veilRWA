import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LenisProvider } from "@/components/providers/lenis-provider"
import { Web3Provider } from "@/components/providers/web3-provider"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "VeilRWA | Privacy-Preserving RealFi on Mantle",
  description:
    "Compliant access to real-world yield using zero-knowledge proofs. Proving eligibility and yield entitlement without revealing identity, balances, or strategies.",
  keywords: ["RWA", "Zero-Knowledge", "ZK", "Privacy", "DeFi", "Mantle", "RealFi", "Compliance"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Instrument+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} font-sans antialiased bg-zinc-950 text-zinc-100`}>
        <Web3Provider>
          <LenisProvider>{children}</LenisProvider>
        </Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
