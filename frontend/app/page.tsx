"use client"

import Link from "next/link"
import { LiquidCtaButton } from "@/components/buttons/liquid-cta-button"
import { Shield, Sparkles, ArrowRight, Lock, Eye, Zap, BarChart3, Command, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/ui/navbar"

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-transparent to-transparent" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 mb-8">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">Built on Mantle Network</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-zinc-100 block">Privacy-Preserving</span>
            <span className="bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
              RealFi on Mantle.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            Compliant access to real-world yield using zero-knowledge proofs. Prove eligibility without revealing identity, balances, or strategies.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/vault">
              <LiquidCtaButton>Launch App</LiquidCtaButton>
            </Link>
            <Link
              href="#features"
              className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <span>See how it works</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {/* Social proof / Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 pt-8 border-t border-zinc-800/50">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-zinc-100">ZK Proofs</div>
              <div className="text-sm text-zinc-500 mt-1">Privacy First</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-zinc-100">Compliant</div>
              <div className="text-sm text-zinc-500 mt-1">KYC Verified</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-zinc-100">5% APY</div>
              <div className="text-sm text-zinc-500 mt-1">Fixed Yield</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Features</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-balance">
              Privacy-preserving features designed to enable compliant RWA access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Card 1 - Privacy (wider - 3 cols) */}
            <div className="md:col-span-3">
              <Card className="group h-full overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    </div>
                    <p className="font-heading font-semibold text-zinc-100">Zero-Knowledge Privacy</p>
                  </div>
                  <p className="text-zinc-500 text-sm mb-5">
                    Prove eligibility and yield entitlement without revealing identity, balances, or strategies on-chain.
                  </p>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-500">Balance: </span>
                      <span className="text-zinc-300 font-mono">Hidden</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-500">Yield: </span>
                      <span className="text-zinc-300 font-mono">Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-500">Identity: </span>
                      <span className="text-zinc-300 font-mono">Private</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Card 2 - Performance (narrower - 2 cols) */}
            <div className="md:col-span-2">
              <Card className="group h-full overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    </div>
                    <p className="font-heading font-semibold text-zinc-100">Blazing Fast</p>
                  </div>
                  <p className="text-zinc-500 text-sm mb-5">Low fees on Mantle Network.</p>
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-4xl font-display font-bold text-zinc-100">5%</span>
                      <span className="text-zinc-500 text-sm">Fixed APY</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full w-[95%] bg-gradient-to-r from-zinc-500 to-zinc-300 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Card 3 - Compliance (narrower - 2 cols) */}
            <div className="md:col-span-2">
              <Card className="group h-full overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Command className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    </div>
                    <p className="font-heading font-semibold text-zinc-100">KYC Verified</p>
                  </div>
                  <p className="text-zinc-500 text-sm mb-5">
                    Selective disclosure credentials for regulatory compliance.
                  </p>
                  <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Status</span>
                      <span className="text-sm text-zinc-100 font-semibold">✓ Verified</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Card 4 - Integration (wider - 3 cols) */}
            <div className="md:col-span-3">
              <Card className="group h-full overflow-hidden border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    </div>
                    <p className="font-heading font-semibold text-zinc-100">Built for Mantle</p>
                  </div>
                  <p className="text-zinc-500 text-sm mb-5">
                    Leverages Mantle's low gas costs and high throughput for practical ZK proof verification.
                  </p>
                  <div className="flex gap-3">
                    {["Low Fees", "Fast Finality", "EVM Compatible"].map((feature) => (
                      <div
                        key={feature}
                        className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 text-center"
                      >
                        <span className="text-xs text-zinc-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 py-24 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              How It Works
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Five simple steps to private, compliant yield
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { step: "1", icon: Shield, title: "Complete KYC", desc: "Off-chain verification" },
              { step: "2", icon: Lock, title: "Generate Proof", desc: "Prove eligibility privately" },
              { step: "3", icon: BarChart3, title: "Deposit Funds", desc: "Balance fully private" },
              { step: "4", icon: Eye, title: "Earn Yield", desc: "5% APY accumulates" },
              { step: "5", icon: Zap, title: "Claim Privately", desc: "ZK proof verification" }
            ].map((item) => (
              <Card key={item.step} className="bg-zinc-900 border-zinc-800 text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div className="text-sm text-zinc-500 font-semibold">Step {item.step}</div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-zinc-100 mb-4">
            Ready to Experience Private RealFi?
          </h2>
          <p className="text-xl text-zinc-500 mb-8">
            Join the future of compliant, privacy-preserving yield on Mantle Network
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vault">
              <LiquidCtaButton>Launch App</LiquidCtaButton>
            </Link>
            <Link
              href="https://github.com/Rohitamalraj/zk-veilRWA"
              className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors justify-center"
            >
              <span>View on GitHub</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-display text-2xl font-bold text-zinc-100">
              VeilRWA
            </div>
            
            <div className="flex gap-6 text-sm text-zinc-500">
              <Link href="#" className="hover:text-zinc-300 transition">Documentation</Link>
              <Link href="https://github.com/Rohitamalraj/zk-veilRWA" className="hover:text-zinc-300 transition">GitHub</Link>
              <Link href="#" className="hover:text-zinc-300 transition">Twitter</Link>
            </div>
            
            <div className="text-sm text-zinc-500">
              Built for Mantle Global Hackathon 2025
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
